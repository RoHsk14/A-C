'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateCommunity, deleteCommunity } from '@/app/(dashboard)/creator/communities/actions'
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

interface CommunitySettingsFormProps {
    community: {
        id: string
        name: string
        description: string | null
        slug: string
    }
}

export function CommunitySettingsForm({ community }: CommunitySettingsFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleUpdate = async (formData: FormData) => {
        setLoading(true)
        try {
            await updateCommunity(community.id, formData)
            toast.success("Communauté mise à jour !")
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
            await deleteCommunity(community.id)
            toast.success("Communauté supprimée.")
            router.push('/creator/communities')
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
                        <Label htmlFor="name">Nom de la communauté</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={community.name}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Identifiant (Slug)</Label>
                        <Input
                            id="slug"
                            value={community.slug}
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
                            defaultValue={community.description || ''}
                            className="min-h-[100px]"
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
                            La suppression d'une communauté est irréversible et supprimera tous les espaces et contenus associés.
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" disabled={deleteLoading}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer la communauté
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900">
                            <DialogHeader>
                                <DialogTitle className="text-red-600">Êtes-vous absolument sûr ?</DialogTitle>
                                <DialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement la communauté
                                    <strong> {community.name} </strong>
                                    et toutes les données associées.
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
