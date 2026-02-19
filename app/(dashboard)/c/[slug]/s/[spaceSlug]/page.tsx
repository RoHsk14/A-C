
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { fetchPosts } from '@/app/actions'
import { FeedList } from '@/components/feed-list'
import { CreatePostForm } from '@/components/create-post-form'
import { Card, CardContent } from '@/components/ui/card'
import { VoiceRoom } from '@/components/voice/voice-room'
import { ShieldCheck, ChevronRight, Globe, Users, Star, Heart, Zap, Rocket, MessageCircle, Coffee, Hash } from 'lucide-react'
import Link from 'next/link'

// Icon mapping
const iconMap: Record<string, any> = {
    Globe, Users, Star, Heart, Zap, Rocket, MessageCircle, Coffee, Hash
}

export default async function SpacePage({
    params,
}: {
    params: Promise<{ slug: string; spaceSlug: string }>
}) {
    const { slug, spaceSlug } = await params
    const supabase = await createClient()

    // 1. Fetch Space and Verify Community
    const { data: space } = await supabase
        .from('spaces')
        .select('*, community:communities(slug, creator_id)')
        .eq('slug', spaceSlug)
        .single()

    if (!space || space.community?.slug !== slug) {
        return notFound()
    }

    // 2. Fetch Posts
    const posts = space.type === 'voice' ? [] : await fetchPosts(0, 20, space.id)

    // 3. User & Admin check
    const { data: { user } } = await supabase.auth.getUser()
    // Admin check logic optional here depending on needs

    const SpaceIcon = space.icon ? iconMap[space.icon] : Hash

    return (
        <div className={`max-w-7xl mx-auto ${space.type === 'voice' ? 'p-0 lg:px-4 lg:py-8' : 'px-4 py-8'}`}>
            <div className={`grid grid-cols-1 ${space.type === 'voice' ? '' : 'lg:grid-cols-12'} gap-8`}>
                <div className={`${space.type === 'voice' ? 'w-full' : 'lg:col-span-8'} space-y-6`}>
                    {/* Header - Hidden for Voice Rooms to maximize space */}
                    {space.type !== 'voice' && (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg"
                            style={{
                                background: space.accent_color
                                    ? `linear-gradient(135deg, ${space.accent_color}, ${space.accent_color}dd)`
                                    : undefined
                            }}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <SpaceIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold">{space.name}</h1>
                                        <p className="text-indigo-100 opacity-90">{space.description}</p>
                                    </div>
                                </div>
                                {space.welcome_message && (
                                    <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                        <p className="text-sm font-medium opacity-90">👋 Message de bienvenue</p>
                                        <p className="mt-1 text-white/90 whitespace-pre-wrap">{space.welcome_message}</p>
                                    </div>
                                )}
                            </div>
                            <SpaceIcon className="absolute -bottom-8 -right-8 w-64 h-64 text-white/10 rotate-12" />
                        </div>
                    )}

                    {/* Content */}
                    {space.type === 'voice' ? (
                        <VoiceRoom
                            spaceId={space.id}
                            spaceName={space.name}
                            isOwner={user?.id === space.community?.creator_id}
                        />
                    ) : (
                        <>
                            <CreatePostForm spaceId={space.id} />
                            <div className="space-y-4">
                                {posts.length === 0 ? (
                                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <CardContent className="py-12 text-center">
                                            <p className="text-zinc-500 dark:text-zinc-400">
                                                Aucun post pour le moment.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <FeedList initialPosts={posts} spaceId={space.id} />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
