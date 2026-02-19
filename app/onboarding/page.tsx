'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function OnboardingContent() {
    const searchParams = useSearchParams()
    const missingEmail = searchParams.get('missing_email')
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Non connecté")

            const { error } = await supabase
                .from('profiles')
                .update({ email })
                .eq('id', user.id)

            if (error) throw error

            toast.success("Email enregistré !")
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    if (!missingEmail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold mb-4">Bienvenue sur Afro-Circle !</h1>
                <Button onClick={() => router.push('/dashboard')}>Accéder au Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-md bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                <h1 className="text-2xl font-bold mb-2">Finalisation de l'inscription</h1>
                <p className="text-zinc-500 mb-6">
                    Votre compte Google ne nous a pas fourni votre email. Veuillez le renseigner pour continuer.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Continuer'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    )
}
