import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        const payload = await request.json()

        // Vérifier la signature Flutterwave
        const signature = request.headers.get('verif-hash')
        const secretHash = process.env.FLUTTERWAVE_SECRET_HASH

        if (!signature || signature !== secretHash) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Vérifier le statut du paiement
        if (payload.status === 'successful') {
            const txRef = payload.tx_ref // C'est l'ID de l'enrollment
            const transactionId = payload.id

            // Vérifier la transaction via l'API Flutterwave
            const verifyResponse = await fetch(
                `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    },
                }
            )

            const verifyData = await verifyResponse.json()

            if (
                verifyData.status === 'success' &&
                verifyData.data.status === 'successful' &&
                verifyData.data.amount >= payload.amount
            ) {
                // Paiement vérifié, activer l'enrollment
                const supabase = await createClient()

                const { error } = await supabase
                    .from('enrollments')
                    .update({
                        status: 'active',
                        payment_reference: transactionId.toString(),
                    })
                    .eq('id', txRef)

                if (error) {
                    console.error('Error updating enrollment:', error)
                    return NextResponse.json(
                        { error: 'Failed to update enrollment' },
                        { status: 500 }
                    )
                }

                // --- AUTO-JOIN COMMUNITY LOGIC ---
                try {
                    // 1. Fetch enrollment details to get user_id and course_id
                    const { data: enrollment } = await supabase
                        .from('enrollments')
                        .select('user_id, course_id')
                        .eq('id', txRef)
                        .single()

                    if (enrollment) {
                        // 2. Fetch course details to get community_id
                        const { data: course } = await supabase
                            .from('courses')
                            .select('community_id')
                            .eq('id', enrollment.course_id)
                            .single()

                        if (course && course.community_id) {
                            // 3. Check if user is already a member
                            const { data: existingMember } = await supabase
                                .from('community_members')
                                .select('id')
                                .eq('community_id', course.community_id)
                                .eq('user_id', enrollment.user_id)
                                .single()

                            if (!existingMember) {
                                // 4. Add user to community
                                const { error: joinError } = await supabase
                                    .from('community_members')
                                    .insert({
                                        community_id: course.community_id,
                                        user_id: enrollment.user_id,
                                        role: 'member'
                                    })

                                if (joinError) {
                                    console.error('Failed to auto-join community:', joinError)
                                } else {
                                    console.log(`User ${enrollment.user_id} auto-joined community ${course.community_id}`)
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error in auto-join logic:', err)
                    // We don't fail the request if auto-join fails, as payment was successful
                }
                // ---------------------------------

                return NextResponse.json({ success: true })
            }
        }

        return NextResponse.json({ message: 'Payment not successful' })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
