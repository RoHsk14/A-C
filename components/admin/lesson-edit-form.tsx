'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Loader2, Video, FileText, LayoutDashboard, Save, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { updateLesson } from '@/app/(dashboard)/creator/actions'

interface LessonEditFormProps {
    initialData: any
    courseId: string
    lessonId: string
}

export function LessonEditForm({ initialData, courseId, lessonId }: LessonEditFormProps) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(initialData.title)
    const [description, setDescription] = useState(initialData.description || '')
    const [content, setContent] = useState(initialData.content || '')
    const [videoId, setVideoId] = useState(initialData.video_url || initialData.video_id || '')
    const [isPreview, setIsPreview] = useState(initialData.is_preview || false)

    const router = useRouter()

    const onSubmit = async () => {
        setLoading(true)
        try {
            await updateLesson(lessonId, {
                title: title.trim(),
                content: content,
                video_url: videoId.trim(),
                video_id: videoId.trim(),
                is_preview: isPreview
            }, courseId)

            alert('Leçon sauvegardée !')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la sauvegarde")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-indigo-500" />
                        Informations de base
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Titre de la leçon</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Introduction au module..."
                        />
                    </div>
                    <div className="flex items-center justify-between border p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                        <div className="space-y-0.5">
                            <Label>Accès Gratuit (Aperçu)</Label>
                            <p className="text-xs text-muted-foreground">
                                Si coché, cette leçon sera visible sans achat.
                            </p>
                        </div>
                        <Switch
                            checked={isPreview}
                            onCheckedChange={setIsPreview}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-indigo-500" />
                        Vidéo (YouTube, Mux ou Fichier)
                    </CardTitle>
                    <CardDescription>
                        Importez un fichier vidéo ou collez un lien (YouTube/Mux).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Upload Section */}
                    <div className="space-y-2 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-dashed border-zinc-300 dark:border-zinc-700">
                        <Label className="block mb-2 font-semibold">Uploader une vidéo (Fichier MP4)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="video/mp4,video/webm,video/ogg"
                                disabled={loading}
                                className="cursor-pointer file:text-indigo-600 file:font-semibold hover:file:bg-indigo-50"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return

                                    setLoading(true)
                                    try {
                                        const { createClient } = await import('@/lib/supabase/client')
                                        const supabase = createClient()

                                        const fileExt = file.name.split('.').pop()
                                        // Create clean filename
                                        const fileName = `${courseId}/${lessonId}/${Date.now()}.${fileExt}`

                                        // Upload
                                        const { error: uploadError, data } = await supabase.storage
                                            .from('videos')
                                            .upload(fileName, file)

                                        if (uploadError) throw uploadError

                                        // Get URL
                                        const { data: { publicUrl } } = supabase.storage
                                            .from('videos')
                                            .getPublicUrl(fileName)

                                        setVideoId(publicUrl)
                                        alert("Vidéo uploadée avec succès !")

                                    } catch (error: any) {
                                        console.error(error)
                                        alert('Erreur upload: ' + error.message)
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                            />
                            {loading && <Loader2 className="animate-spin h-5 w-5 text-indigo-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Fichiers .mp4 recommandés. Le streaming se fera directement depuis le serveur.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">Ou via lien</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Lien Vidéo / ID</Label>
                        <Input
                            value={videoId}
                            onChange={(e) => setVideoId(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={videoId ? "border-indigo-200 focus:border-indigo-500" : ""}
                        />

                        {/* Validation Feedback */}
                        {videoId && (
                            <div className="flex items-center gap-2 mt-2 text-sm animate-in fade-in slide-in-from-top-1">
                                {(() => {
                                    const clean = videoId.trim()
                                    const lower = clean.toLowerCase()
                                    const isYoutube = clean.length === 11 || lower.includes('youtube') || lower.includes('youtu.be')
                                    const isMux = !isYoutube && (clean.includes('stream.mux.com') || (clean.length > 20 && !clean.includes('.') && !clean.includes('http')))
                                    const isFile = lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm')

                                    if (isYoutube) {
                                        return (
                                            <span className="text-green-700 flex items-center bg-green-50 px-2 py-1 rounded-md border border-green-200 font-medium whitespace-nowrap">
                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                YouTube détecté
                                            </span>
                                        )
                                    } else if (isMux) {
                                        return (
                                            <span className="text-purple-700 flex items-center bg-purple-50 px-2 py-1 rounded-md border border-purple-200 font-medium whitespace-nowrap">
                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                ID Mux détecté
                                            </span>
                                        )
                                    } else if (isFile) {
                                        return (
                                            <span className="text-blue-700 flex items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-200 font-medium whitespace-nowrap">
                                                <Upload className="h-3.5 w-3.5 mr-1.5" />
                                                Fichier vidéo détecté
                                            </span>
                                        )
                                    } else {
                                        return (
                                            <span className="text-amber-700 flex items-center bg-amber-50 px-2 py-1 rounded-md border border-amber-200 font-medium whitespace-nowrap">
                                                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                                Format inconnu
                                            </span>
                                        )
                                    }
                                })()}
                            </div>
                        )}

                        <p className="text-xs text-zinc-500">
                            Supporte YouTube, Mux, et fichiers directs MP4.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        Contenu de la leçon
                    </CardTitle>
                    <CardDescription>
                        Description, notes, ou contenu texte complet (Markdown supporté).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="w-full min-h-[300px] p-4 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="# Titre de la section&#10;&#10;Votre contenu ici..."
                    />
                </CardContent>
            </Card>

            <div className="flex items-center justify-end">
                <Button onClick={onSubmit} disabled={loading} size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                </Button>
            </div>
        </div>
    )
}
