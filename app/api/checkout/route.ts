import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId, currency } = await request.json()

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
        }

        // Récupérer le cours et le profil utilisateur
        const { data: course } = await supabase
            .from('courses')
            .select('id, title, price_xof, price_usd')
            .eq('id', courseId)
            .single()

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('phone, name')
            .eq('id', user.id)
            .single()

        if (!profile?.phone) {
            return NextResponse.json(
                { error: 'Phone number required for Mobile Money payments' },
                { status: 400 }
            )
        }

        // Déterminer le montant selon la devise
        const amount = currency === 'XOF' ? course.price_xof : course.price_usd
        const actualCurrency = currency === 'XOF' ? 'XOF' : 'USD'

        // Créer un enrollment en attente
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('enrollments')
            .insert({
                user_id: user.id,
                course_id: course.id,
                status: 'pending',
                payment_provider: 'flutterwave', // ou 'paystack'
            })
            .select()
            .single()

        if (enrollmentError) {
            console.error('Error creating enrollment:', enrollmentError)
            return NextResponse.json(
                { error: 'Failed to create enrollment' },
                { status: 500 }
            )
        }

        // Initialiser le paiement Flutterwave
        // Note: Vous devrez configurer vos clés API Flutterwave
        const flutterwavePayload = {
            tx_ref: enrollment.id, // Utiliser l'ID enrollment comme référence
            amount: actualCurrency === 'XOF' ? amount : amount / 100,
            currency: actualCurrency,
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            customer: {
                email: user.email,
                phonenumber: profile.phone,
                name: profile.name,
            },
            customizations: {
                title: course.title,
                description: `Paiement pour ${course.title}`,
                logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
            },
            payment_options: 'mobilemoney', // Focus Mobile Money
        }

        // Appel API Flutterwave
        const flutterwaveResponse = await fetch(
            'https://api.flutterwave.com/v3/payments',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(flutterwavePayload),
            }
        )

        const flutterwaveData = await flutterwaveResponse.json()

        if (flutterwaveData.status === 'success') {
            // Mettre à jour l'enrollment avec la référence de paiement
            await supabase
                .from('enrollments')
                .update({
                    payment_reference: flutterwaveData.data.tx_ref,
                })
                .eq('id', enrollment.id)

            return NextResponse.json({
                paymentUrl: flutterwaveData.data.link,
            })
        } else {
            console.error('Flutterwave error:', flutterwaveData)
            return NextResponse.json(
                { error: 'Payment initialization failed' },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
