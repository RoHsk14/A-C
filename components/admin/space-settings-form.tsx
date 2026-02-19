'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateSpace, deleteSpace } from '@/app/(dashboard)/creator/communities/actions'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"

interface SpaceSettingsFormProps {
    space: {
        id: string
        name: string
        slug: string
        description: string | null
        is_private: boolean
        accent_color: string | null
        icon: string | null
        welcome_message: string | null
        community_id: string
    }
    communitySlug: string
}

export function SpaceSettingsForm({ space, communitySlug }: SpaceSettingsFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [isPrivate, setIsPrivate] = useState(space.is_private)

    const handleUpdate = async (formData: FormData) => {
        setLoading(true)
        formData.set('is_private_value', String(isPrivate))

        try {
            await updateSpace(space.id, formData)
            toast.success("Espace mis à jour !")
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            await deleteSpace(space.id)
            toast.success("Espace supprimé.")
            router.push(`/creator/communities/${communitySlug}`)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la suppression")
            setDeleteLoading(false)
        }
    }

    return (
        <div className="space-y-10">
            <form action={handleUpdate} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom de l'espace</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={space.name}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Identifiant (Slug)</Label>
                        <Input
                            id="slug"
                            value={space.slug}
                            disabled
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        />
                        <p className="text-xs text-muted-foreground">L'identifiant ne peut pas être modifié.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={space.description || ''}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="welcome_message">Message de bienvenue</Label>
                        <Textarea
                            id="welcome_message"
                            name="welcome_message"
                            defaultValue={space.welcome_message || ''}
                            placeholder="Message affiché en haut de l'espace..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="icon">Icône (Emoji)</Label>
                            <Input
                                id="icon"
                                name="icon"
                                defaultValue={space.icon || ''}
                                placeholder="🚀"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="accent_color">Couleur (Hex)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="accent_color"
                                    name="accent_color"
                                    type="color"
                                    defaultValue={space.accent_color || '#000000'}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    name="accent_color_text"
                                    defaultValue={space.accent_color || '#000000'}
                                    className="flex-1"
                                    onChange={(e) => {
                                        // Optional: link generic text input to color picker
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Espace Privé</Label>
                            <p className="text-sm text-muted-foreground">
                                Seuls les membres invités peuvent voir cet espace.
                            </p>
                        </div>
                        <Switch
                            checked={isPrivate}
                            onCheckedChange={setIsPrivate}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                </Button>
            </form>

            <div className="pt-6 border-t border-red-100 dark:border-red-900/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-red-600 dark:text-red-500">Zone de danger</h3>
                        <p className="text-sm text-zinc-500">
                            La suppression d'un espace est irréversible et supprimera tous les posts associés.
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" disabled={deleteLoading}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer l'espace
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900">
                            <DialogHeader>
                                <DialogTitle className="text-red-600">Êtes-vous absolument sûr ?</DialogTitle>
                                <DialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement l'espace
                                    <strong> {space.name} </strong>
                                    et tout son contenu.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                                    {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirmer la suppression
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
