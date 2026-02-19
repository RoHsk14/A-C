'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createComment } from '@/app/actions'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Comment {
    id: string
    content: string
    created_at: string
    author: {
        name: string
        email: string
    }
}

interface CommentSectionProps {
    postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchComments()
    }, [postId])

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select(`
        id,
        content,
        created_at,
        author:profiles!comments_author_id_fkey(name, email)
      `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (!error && data) {
            setComments(data as any)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            await createComment(postId, newComment)
            setNewComment('')
            fetchComments() // Refresh comments (could also be optimized by returning the new comment and appending)
        } catch (error) {
            console.error('Failed to post comment', error)
        } finally {
            setSubmitting(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Liste des commentaires */}
            {comments.length > 0 && (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {getInitials(comment.author.name)}
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                    <p className="font-semibold text-sm">{comment.author.name}</p>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-3">
                                    {formatDistanceToNow(new Date(comment.created_at), {
                                        addSuffix: true,
                                        locale: fr,
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulaire de nouveau commentaire */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrivez un commentaire..."
                    disabled={submitting}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={submitting || !newComment.trim()}
                >
                    {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Envoyer'
                    )}
                </Button>
            </form>
        </div>
    )
}
