'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createSpace } from '@/app/(dashboard)/creator/communities/actions'
import { toast } from 'sonner'
import { Loader2, Hash, Globe, Lock, MessageCircle } from 'lucide-react'

interface CreateSpaceFormProps {
    communityId: string
    communitySlug?: string
}

export function CreateSpaceForm({ communityId, communitySlug }: CreateSpaceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)

        if (!isSlugManuallyEdited) {
            const cleanName = value.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')

            // Prefix with community slug if available to avoid collisions
            const newSlug = communitySlug
                ? `${communitySlug}-${cleanName}`
                : cleanName

            setSlug(newSlug)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            await createSpace(communityId, formData)
            toast.success("Espace créé avec succès !")
            // Redirect to community details or new space?
            // Action revalidates, we can push to community dashboard
            router.push(`/creator/communities`)
            // Or better: router.back() or to the community page if we had the slug in props.
            // For now let's push to list.
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
                    <Label htmlFor="name">Nom de l'espace</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Ex: Marketing Digital, Support VIP..."
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="slug">Identifiant (Slug)</Label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="slug"
                            name="slug"
                            placeholder={communitySlug ? `${communitySlug}-nom-espace` : "nom-espace"}
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.target.value)
                                setIsSlugManuallyEdited(true)
                            }}
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
                        placeholder="De quoi parle cet espace ?"
                        className="min-h-[100px]"
                    />
                </div>

                <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded-full border border-zinc-100 dark:border-zinc-700">
                            {isPrivate ? <Lock className="h-5 w-5 text-indigo-500" /> : <Globe className="h-5 w-5 text-emerald-500" />}
                        </div>
                        <div className="space-y-0.5">
                            <Label htmlFor="is_private" className="text-base font-medium">
                                {isPrivate ? 'Espace Privé' : 'Espace Public'}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {isPrivate
                                    ? "Seuls les membres invités ou inscrits peuvent voir le contenu."
                                    : "Tout le monde peut voir cet espace et s'y exprimer."}
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="is_private"
                        name="is_private"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                    />
                    {/* Hidden input to pass boolean in FormData */}
                    <input type="hidden" name="is_private_value" value={isPrivate ? 'true' : 'false'} />
                </div>

                <div className="grid gap-2">
                    <Label>Type d'espace</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="cursor-pointer relative">
                            <input type="radio" name="type" value="text" className="peer sr-only" defaultChecked />
                            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 peer-checked:border-indigo-500 peer-checked:ring-1 peer-checked:ring-indigo-500 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                                    <span className="font-medium">Discussion</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Fil d'actualité, posts, commentaires et likes.</p>
                            </div>
                        </label>
                        <label className="cursor-pointer relative">
                            <input type="radio" name="type" value="voice" className="peer sr-only" />
                            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 peer-checked:border-indigo-500 peer-checked:ring-1 peer-checked:ring-indigo-500 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </div>
                                    <span className="font-medium">Salon Vocal</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Salon audio en direct pour échanger de vive voix.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="accent_color">Couleur d'accent</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="accent_color"
                                name="accent_color"
                                type="color"
                                className="w-12 h-10 p-1 cursor-pointer"
                                defaultValue="#4f46e5"
                            />
                            <Label htmlFor="accent_color" className="text-xs text-muted-foreground">
                                Choisir la couleur principale
                            </Label>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="icon">Icône (Lucide)</Label>
                        <select
                            id="icon"
                            name="icon"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue="Hash"
                        >
                            <option value="Hash"># Hash (Défaut)</option>
                            <option value="Globe">🌍 Globe</option>
                            <option value="Users">👥 Users</option>
                            <option value="Star">⭐ Star</option>
                            <option value="Heart">❤️ Heart</option>
                            <option value="Zap">⚡ Zap</option>
                            <option value="Rocket">🚀 Rocket</option>
                            <option value="MessageCircle">💬 Message</option>
                            <option value="Coffee">☕ Coffee</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="welcome_message">Message de bienvenue</Label>
                    <Textarea
                        id="welcome_message"
                        name="welcome_message"
                        placeholder="Message épinglé en haut de l'espace pour accueillir les membres..."
                        className="min-h-[80px]"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'espace
            </Button>
        </form>
    )
}
