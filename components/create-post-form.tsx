'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RichTextEditor } from '@/components/editor/rich-text-editor'

import { getMySpaces } from '@/app/actions'

interface CreatePostFormProps {
    spaceId?: string
    onPostCreated?: () => void
}

export function CreatePostForm({ spaceId, onPostCreated }: CreatePostFormProps) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [actualSpaceId, setActualSpaceId] = useState<string | undefined>(spaceId)
    const [spaces, setSpaces] = useState<any[]>([])

    // Gestion fichiers
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // Gestion de la hauteur automatique
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [content])

    // Fetch spaces pour le sélecteur
    useEffect(() => {
        async function fetchSpaces() {
            try {
                const data = await getMySpaces()
                if (data) setSpaces(data)

                // Si pas de spaceId pré-défini, on essaie de mettre le premier disponible
                if (!spaceId && !actualSpaceId && data && data.length > 0) {
                    setActualSpaceId(data[0].id)
                }
            } catch (err) {
                console.error('Erreur loading spaces:', err)
            }
        }
        fetchSpaces()
    }, [spaceId, actualSpaceId])

    useEffect(() => {
        if (spaceId) setActualSpaceId(spaceId)
    }, [spaceId])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const validFiles = files.filter(file => {
                if (file.size > 10 * 1024 * 1024) {
                    setError(`Le fichier ${file.name} est trop volumineux (max 10MB)`)
                    return false
                }
                return true
            })
            setSelectedFiles(prev => [...prev, ...validFiles])
            setError(null)
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if ((!content.trim() && selectedFiles.length === 0)) {
            return
        }

        if (!actualSpaceId) {
            setError('Veuillez sélectionner un espace')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Non connecté')

            const attachments = []

            // Upload files (Client side upload to Storage is fine/better for large files)
            // We just pass the URLs to the server action
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                    const filePath = `${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('posts')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('posts')
                        .getPublicUrl(filePath)

                    const type = file.type.startsWith('image/') ? 'image' : 'file'

                    attachments.push({
                        type,
                        url: publicUrl,
                        name: file.name,
                        size: file.size,
                        mimeType: file.type
                    })
                }
            }

            // Créer le post via Server Action (Validation sécurisée)
            const { createPost } = await import('@/app/actions')
            await createPost(actualSpaceId, content, attachments)

            // Reset
            setContent('')
            setSelectedFiles([])
            if (fileInputRef.current) fileInputRef.current.value = ''

            if (onPostCreated) {
                onPostCreated()
            } else {
                router.refresh()
            }
        } catch (err: any) {
            console.error('Erreur:', err)
            setError(err.message || 'Erreur lors de la publication')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-4 pb-3 px-4 md:px-6 relative">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sélecteur d'espace si non pré-défini */}
                    {!spaceId && (
                        <select
                            value={actualSpaceId || ''}
                            onChange={(e) => setActualSpaceId(e.target.value)}
                            className="text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-3 py-1 font-medium text-zinc-600 dark:text-zinc-300 focus:ring-0 cursor-pointer mb-2"
                        >
                            <option value="" disabled>Choisir un espace</option>
                            {spaces.map(s => (
                                <option key={s.id} value={s.id}>#{s.name}</option>
                            ))}
                        </select>
                    )}

                    <div className="flex gap-4">
                        {/* Avatar Placeholder */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />

                        <div className="flex-1 space-y-3">
                            {/* Logic to get current community ID */}
                            {(() => {
                                const currentSpace = spaces.find(s => s.id === actualSpaceId)
                                const communityId = currentSpace?.community_id

                                return (
                                    <RichTextEditor
                                        key={communityId || 'global'}
                                        content={content}
                                        onChange={(newContent) => setContent(newContent)}
                                        placeholder="Partagez quelque chose avec la communauté..."
                                        className="min-h-[100px]"
                                        communityId={communityId}
                                    />
                                )
                            })()}

                            {/* Preview Files */}
                            {selectedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedFiles.map((file, index) => {
                                        const isImage = file.type.startsWith('image/')
                                        const previewUrl = isImage ? URL.createObjectURL(file) : null

                                        return (
                                            <div key={index} className="relative group">
                                                {isImage ? (
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-200">
                                                        <Image src={previewUrl!} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                                                    </div>
                                                ) : (
                                                    <div className="w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center p-2 text-xs text-center text-zinc-500">
                                                        <span className="font-bold truncate w-full">{file.name.split('.').pop()?.toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm px-2">{error}</div>
                    )}

                    <div className="flex items-center justify-between py-3 px-4 md:px-6 -mx-4 md:-mx-6 -mb-3 border-t border-zinc-100 dark:border-zinc-800 sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur z-10 rounded-b-xl">
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple // Allow multiple
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={loading}
                                onClick={() => fileInputRef.current?.click()}
                                className="text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Ajouter un fichier</span>
                                <span className="sm:hidden">Média</span>
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || (!content.trim() && selectedFiles.length === 0)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? 'Envoi...' : <><span className="mr-2 hidden sm:inline">Publier</span><span className="sm:hidden">Publier</span><Send className="w-3 h-3 sm:ml-0 ml-2" /></>}
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    )
}
