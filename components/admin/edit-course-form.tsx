'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export function EditCourseForm({ course }: { course: any }) {
    const [title, setTitle] = useState(course.title)
    const [description, setDescription] = useState(course.description || '')
    const [price, setPrice] = useState(course.price_xof?.toString() || '0')
    const [loading, setLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(course.thumbnail_url)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()
    const supabase = createClient()

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
            let thumbnailUrl = course.thumbnail_url

            // 1. Upload new Image if present
            if (selectedImage) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
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
            }

            // 2. Update Course
            const { error } = await supabase
                .from('courses')
                .update({
                    title: title.trim(),
                    description: description.trim(),
                    price_xof: parseInt(price) || 0,
                    thumbnail_url: thumbnailUrl,
                })
                .eq('id', course.id)

            if (error) throw error

            router.push('/admin/courses')
            router.refresh()

        } catch (error) {
            console.error('Error updating course:', error)
            alert('Erreur: ' + (error as any).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Description courte</Label>
                        <textarea
                            id="desc"
                            disabled={loading}
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
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || loading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
