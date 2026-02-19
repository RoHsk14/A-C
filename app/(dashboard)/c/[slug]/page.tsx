
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getCommunityBySlug, fetchPosts } from '@/app/actions'
import { FeedList } from '@/components/feed-list'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
import Image from 'next/image'

export default async function CommunityPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const community = await getCommunityBySlug(slug)

    if (!community) {
        return notFound()
    }

    const posts = await fetchPosts(0, 20, undefined, community.id)

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Community Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="relative w-24 h-24 rounded-2xl border-4 border-white/20 bg-white shadow-md overflow-hidden flex-shrink-0">
                                {community.logo_url ? (
                                    <Image
                                        src={community.logo_url}
                                        alt={community.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-3xl">
                                        {community.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{community.name}</h1>
                                <p className="text-indigo-100 opacity-90 mt-2 text-lg">{community.description}</p>
                            </div>
                        </div>
                        {/* Decorative Icon */}
                        <Users className="absolute -bottom-8 -right-8 w-64 h-64 text-white/10 rotate-12" />
                    </div>

                    {/* Feed */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Fil d'actualité</h2>
                        </div>

                        {posts.length === 0 ? (
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <CardContent className="py-12 text-center">
                                    <p className="text-zinc-500 dark:text-zinc-400">
                                        Aucune publication récente dans cette communauté.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <FeedList initialPosts={posts} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
