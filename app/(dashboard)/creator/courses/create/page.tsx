'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateCoursePage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('0')
    const [communityId, setCommunityId] = useState<string>('')
    const [communities, setCommunities] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchCommunities = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('communities')
                .select('id, name')
                .eq('creator_id', user.id) // Only communities I own
                .order('name')

            if (data) setCommunities(data)
        }
        fetchCommunities()
    }, [])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Upload Image if present
            let thumbnailUrl = null
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop()
                const fileName = `${user.id}-${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('courses')
                    .upload(filePath, selectedImage)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('courses')
                    .getPublicUrl(filePath)

                thumbnailUrl = publicUrl
            }

            // 2. Create Course
            const slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7)

            const { data, error } = await supabase
                .from('courses')
                .insert({
                    title: title.trim(),
                    slug: slug,
                    description: description.trim(),
                    price_xof: parseInt(price) || 0,
                    thumbnail_url: thumbnailUrl,
                    instructor_id: user.id,
                    community_id: communityId || null,
                    is_published: false
                })
                .select()
                .single()

            if (error) throw error

            router.push(`/creator/courses/${data.id}/builder`)
            router.refresh()

        } catch (error) {
            console.error('Error creating course:', error)
            alert('Erreur: ' + (error as any).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Créer une nouvelle formation</CardTitle>
                    <CardDescription>
                        Remplissez les informations de base pour commencer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* IMAGE COVER */}
                        <div className="space-y-2">
                            <Label>Image de couverture</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${imagePreview ? 'border-zinc-200 dark:border-zinc-800' : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <span className="text-white font-medium">Changer l'image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-zinc-500">
                                        <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-medium">Cliquez pour ajouter un visuel</p>
                                        <p className="text-xs text-zinc-400">1200x600 recommandé</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Titre de la formation</Label>
                            <Input
                                id="title"
                                disabled={loading}
                                placeholder="ex: Devenir Expert Dropshipping 2024"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community">Communauté rattachée (Optionnel)</Label>
                            <Select onValueChange={setCommunityId} value={communityId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une communauté" />
                                </SelectTrigger>
                                <SelectContent>
                                    {communities.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-zinc-500">Les membres de cette communauté auront accès ou verront ce cours.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Description courte</Label>
                            <textarea
                                id="desc"
                                disabled={loading}
                                placeholder="En quelques mots..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Prix (FCFA)</Label>
                            <Input
                                id="price"
                                type="number"
                                disabled={loading}
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <p className="text-[10px] text-zinc-500">Mettez 0 pour une formation gratuite.</p>
                        </div>

                        <div className="flex items-center justify-end gap-x-2 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={!title.trim() || loading}
                                className="min-w-[120px]"
                                variant="brand"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Créer & Continuer
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
