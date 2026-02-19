'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialButtons } from '@/components/auth/social-buttons'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/communities')
            router.refresh()
        }
    }

    return (
        <Card className="border-0 shadow-none md:border md:shadow-md bg-transparent md:bg-white/50 md:backdrop-blur-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    Bon retour 👋
                </CardTitle>
                <CardDescription className="text-center">
                    Connectez-vous à votre empire Afro-Circle
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <SocialButtons />

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="votre@email.com"
                            className="h-11 rounded-xl bg-white/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                                Oublié ?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="h-11 rounded-xl bg-white/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-600/20"
                        disabled={loading}
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="text-indigo-600 hover:underline font-medium">
                        Créer un empire
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
