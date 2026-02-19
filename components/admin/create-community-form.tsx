'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCommunity } from '@/app/actions'
import { toast } from 'sonner'
import { Loader2, Users } from 'lucide-react'

export function CreateCommunityForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)
        setSlug(value.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-'))
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            await createCommunity(name, formData.get('description') as string, slug)
            toast.success("Communauté créée avec succès !")
            router.push('/creator/communities')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la création")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nom de la communauté</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Ex: Club Privé, Formation React, Communauté Freelance..."
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="slug">Identifiant (Slug)</Label>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="slug"
                            name="slug"
                            placeholder="club-prive"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="pl-9"
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Quel est l'objectif de cette communauté ?"
                        className="min-h-[100px]"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer la communauté
            </Button>
        </form>
    )
}
