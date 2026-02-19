import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Paiement Réussi !</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 text-center">
                    <p className="text-muted-foreground">
                        Félicitations ! Votre paiement a été traité avec succès. Vous avez maintenant accès à votre formation.
                    </p>

                    <div className="bg-indigo-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-indigo-900 mb-2">
                            🎉 Bienvenue dans la formation !
                        </p>
                        <p className="text-sm text-indigo-700">
                            Vous pouvez commencer à apprendre dès maintenant.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button asChild className="w-full" size="lg">
                            <Link href="/courses">
                                <ArrowRight className="mr-2 h-5 w-5" />
                                Voir mes formations
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard">
                                Retour au tableau de bord
                            </Link>
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Un email de confirmation vous a été envoyé.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
