'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AccessDeniedProps {
    courseId: string
    courseTitle: string
    priceXof: number
    priceUsd: number
}

export function AccessDenied({ courseId, courseTitle, priceXof, priceUsd }: AccessDeniedProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId,
                    currency: 'XOF',
                }),
            })

            const data = await response.json()

            if (data.paymentUrl) {
                // Rediriger vers la page de paiement
                window.location.href = data.paymentUrl
            } else {
                alert('Erreur lors de l\'initialisation du paiement')
                setLoading(false)
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Erreur lors de l\'initialisation du paiement')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Lock className="h-8 w-8 text-indigo-600" />
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Accès Restreint
                        </h2>
                        <p className="text-muted-foreground">
                            Cette formation nécessite un abonnement pour accéder au contenu.
                        </p>
                    </div>

                    {/* Course Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-2">{courseTitle}</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-bold text-indigo-600">
                                {priceXof.toLocaleString('fr-FR')} XOF
                            </span>
                            <span className="text-sm text-muted-foreground">
                                (~${(priceUsd / 100).toFixed(2)})
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <Button
                        onClick={handleCheckout}
                        disabled={loading}
                        size="lg"
                        className="w-full"
                    >
                        <CreditCard className="mr-2 h-5 w-5" />
                        {loading ? 'Chargement...' : 'Acheter maintenant'}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Paiement sécurisé via Mobile Money (MTN, Moov, Orange)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
