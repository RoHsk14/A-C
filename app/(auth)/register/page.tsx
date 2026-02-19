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

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation basic
        if (!name || !email || !phone || !password) {
            setError('Veuillez remplir tous les champs')
            return
        }

        if (!email.includes('@')) {
            setError('Veuillez entrer une adresse email valide')
            return
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    name: name.trim(),
                    phone: phone.trim(),
                },
            },
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
                    Créer un compte
                </CardTitle>
                <CardDescription className="text-center">
                    Rejoignez les créateurs de l'élite africaine
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <SocialButtons />

                <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Jean Dupont"
                            className="h-11 rounded-xl bg-white/50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

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
                        <Label htmlFor="phone">
                            Téléphone (Mobile Money)
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+225 07 07 07 07 07"
                            className="h-11 rounded-xl bg-white/50"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
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
                            minLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum 6 caractères
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-600/20"
                        disabled={loading}
                    >
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                        Se connecter
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
