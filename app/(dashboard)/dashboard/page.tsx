import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import Link from 'next/link'
import { PostCard } from '@/components/post-card'
import { CreatePostForm } from '@/components/create-post-form'
import { FeedList } from '@/components/feed-list'
import { Card, CardContent } from '@/components/ui/card'
import { PostCardSkeleton } from '@/components/skeletons'
import { MembersList } from '@/components/members-list'
import { ShieldCheck, ChevronRight, Globe, Users, Star, Heart, Zap, Rocket, MessageCircle, Coffee, Hash } from 'lucide-react'

// Icon mapping
const iconMap: Record<string, any> = {
    Globe, Users, Star, Heart, Zap, Rocket, MessageCircle, Coffee, Hash
}

interface Post {
    id: string
    content: string
    images: string[] | null
    attachments: any[] | null
    created_at: string
    author: {
        name: string
        avatar_url: string | null
    }
    space: {
        name: string
        slug: string
    }
    likes_count: number
    comments_count: number
    user_has_liked: boolean
}

import { fetchPosts } from '@/app/actions'

import { VoiceRoom } from '@/components/voice/voice-room'

async function getFeedData(spaceSlug?: string) {
    const supabase = await createClient()
    let spaceId: string | undefined

    // Si un slug d'espace est fourni, récupérer son ID et ses détails
    let currentSpace: any = null
    if (spaceSlug) {
        const { data: space } = await supabase
            .from('spaces')
            .select('id, name, slug, description, accent_color, icon, welcome_message, type, community_id, community:communities(creator_id)')
            .eq('slug', spaceSlug)
            .single()

        if (space) {
            spaceId = space.id
            currentSpace = space
        }
    }

    // Utiliser la Server Action centralisée pour récupérer les posts avec le filtrage strict
    // Si c'est un salon vocal, on n'a pas besoin des posts pour l'instant (optimisation)
    const posts = currentSpace?.type === 'voice' ? [] : await fetchPosts(0, 20, spaceId)

    return { posts, spaceId, currentSpace }
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ space?: string }>
}) {
    const { space } = await searchParams
    const spaceSlug = space

    // 1. Fetch Feed Data
    const { posts, spaceId, currentSpace } = await getFeedData(spaceSlug)

    // 2. Check Admin Role
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        isAdmin = profile?.role === 'admin'
    }

    const SpaceIcon = currentSpace?.icon ? iconMap[currentSpace.icon] : Hash

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Feed) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Admin Shortcut */}
                    {isAdmin && !spaceSlug && (
                        <Link href="/admin">
                            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md group mb-8">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <ShieldCheck className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Mode Administrateur</h3>
                                            <p className="text-sm text-indigo-100">Gérer les cours et les utilisateurs</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-indigo-100 group-hover:translate-x-1 transition-transform" />
                                </CardContent>
                            </Card>
                        </Link>
                    )}

                    {/* Branded Header */}
                    <div className="mb-0">
                        {currentSpace ? (
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg"
                                style={{
                                    background: currentSpace.accent_color
                                        ? `linear-gradient(135deg, ${currentSpace.accent_color}, ${currentSpace.accent_color}dd)`
                                        : undefined
                                }}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <SpaceIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold">{currentSpace.name}</h1>
                                            <p className="text-indigo-100 opacity-90">{currentSpace.description}</p>
                                        </div>
                                    </div>

                                    {currentSpace.welcome_message && (
                                        <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                            <p className="text-sm font-medium opacity-90">👋 Message de bienvenue</p>
                                            <p className="mt-1 text-white/90 whitespace-pre-wrap">{currentSpace.welcome_message}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Decorative background Icon */}
                                <SpaceIcon className="absolute -bottom-8 -right-8 w-64 h-64 text-white/10 rotate-12" />
                            </div>
                        ) : (
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Flux</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                    Découvrez les dernières publications de votre communauté
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Content Logic: Voice Room OR Text Feed */}
                    {currentSpace?.type === 'voice' ? (
                        <VoiceRoom
                            spaceId={spaceId!}
                            spaceName={currentSpace.name}
                            isOwner={user?.id && currentSpace.community && currentSpace.community.creator_id === user.id}
                        />
                    ) : (
                        <>
                            {/* Create Post Form */}
                            <CreatePostForm spaceId={spaceId} />

                            {/* Feed */}
                            <div className="space-y-4">
                                {posts.length === 0 ? (
                                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <CardContent className="py-12 text-center">
                                            <p className="text-zinc-500 dark:text-zinc-400">
                                                Aucun post pour le moment. Soyez le premier à publier !
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <FeedList initialPosts={posts} spaceId={spaceId} />
                                )}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
