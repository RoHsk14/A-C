'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, MoreHorizontal, FileText, Download, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { CommentSection } from '@/components/comment-section'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createReport } from '@/app/actions'
import { toast } from 'sonner'

interface PostCardProps {
    post: {
        id: string
        content: string
        images?: string[] | null
        created_at: string
        author: {
            name: string
            avatar_url: string | null
        }
        likes_count?: number
        comments_count?: number
        user_has_liked?: boolean
        attachments?: any[] | null
    }
    onLike?: (postId: string) => void
    onComment?: (postId: string) => void
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.user_has_liked || false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)
    const [showComments, setShowComments] = useState(false)

    // Merge legacy images with attachments if needed, or prefer attachments
    // If we have attachments, use them. If not, fallback to legacy images.
    // Actually, we filled attachments for new posts. Legacy posts only have images.
    // So if attachments is present, use it. If not, map images to attachment format.

    const displayAttachments = post.attachments || (post.images?.map(url => ({ type: 'image', url })) || [])

    const handleLike = async () => {
        // Optimistic update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1)

        try {
            const { toggleLike } = await import('@/app/actions')
            await toggleLike(post.id)
            if (onLike) onLike(post.id)
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setLikesCount(newIsLiked ? likesCount - 1 : likesCount + 1)
            console.error('Error liking post:', error)
        }
    }

    const handleComment = () => {
        setShowComments(!showComments)
        if (onComment && !showComments) {
            onComment(post.id)
        }
    }
    const handleReport = async () => {
        try {
            await createReport(post.id, 'post', 'Contenu inapproprié')
            toast.success('Publication signalée')
        } catch (error) {
            toast.error('Erreur lors du signalement')
        }
    }

    // Générer les initiales de l'auteur
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 md:px-6 pt-4 md:pt-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {/* Avatar avec initiales */}
                            {/* Avatar avec initiales ou Image */}
                            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white dark:ring-zinc-800">
                                {post.author.avatar_url ? (
                                    <Image
                                        src={post.author.avatar_url}
                                        alt={post.author.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    getInitials(post.author.name)
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                    {post.author.name}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {formatDistanceToNow(new Date(post.created_at), {
                                        addSuffix: true,
                                        locale: fr,
                                    })}
                                </p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleReport} className="text-red-600 focus:text-red-600">
                                    <Flag className="mr-2 h-4 w-4" />
                                    Signaler
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="pb-3 px-4 md:px-6">
                    {/* Contenu du post */}
                    {/* Contenu du post */}
                    <div
                        className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 prose prose-indigo dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Attachments (Images & Files) */}
                    {displayAttachments.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {/* Images Grid */}
                            <div className="grid gap-2 grid-cols-1">
                                {displayAttachments.filter(a => a.type === 'image').map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative w-full h-80 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <Image
                                            src={image.url}
                                            alt={`Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Files List */}
                            <div className="space-y-2">
                                {displayAttachments.filter(a => a.type !== 'image').map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                    {file.name || 'Document'}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {(file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Fichier')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild className="shrink-0 text-zinc-500 hover:text-indigo-600">
                                            <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-0 pb-4 px-4 md:px-6 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 mt-3">
                    {/* Bouton Like avec animation */}
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`gap-2 transition-all duration-200 ${isLiked
                                ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <motion.div
                                animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Heart
                                    className={`h-[18px] w-[18px] transition-all ${isLiked ? 'fill-current' : ''
                                        }`}
                                />
                            </motion.div>
                            <span className="text-xs font-medium">
                                {likesCount > 0 ? likesCount : 'J\'aime'}
                            </span>
                        </Button>
                    </motion.div>

                    {/* Bouton Commentaires */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleComment}
                        className="gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                    >
                        <MessageCircle className="h-[18px] w-[18px]" />
                        <span className="text-xs font-medium">
                            {post.comments_count || 0} Commentaire{post.comments_count !== 1 ? 's' : ''}
                        </span>
                    </Button>
                </CardFooter>

                {/* Section commentaires avec animation */}
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50"
                    >
                        <CommentSection postId={post.id} />
                    </motion.div>
                )}
            </Card>
        </motion.div>
    )
}
