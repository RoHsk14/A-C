'use client'

import { useState } from 'react'
import { PostCard } from '@/components/post-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { fetchPosts } from '@/app/actions'

export function FeedList({ initialPosts, spaceId }: { initialPosts: any[], spaceId?: string }) {
    const [posts, setPosts] = useState(initialPosts)
    const [offset, setOffset] = useState(initialPosts.length)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const loadMore = async () => {
        if (loading) return

        setLoading(true)
        try {
            const newPosts = await fetchPosts(offset, 10, spaceId)

            if (newPosts.length === 0) {
                setHasMore(false)
            } else {
                setPosts([...posts, ...newPosts])
                setOffset(offset + newPosts.length)
            }
        } catch (error) {
            console.error('Failed to load more posts', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {hasMore && posts.length > 0 && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={loadMore}
                        disabled={loading}
                        className="text-zinc-500 hover:text-indigo-600"
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {loading ? 'Chargement...' : 'Charger plus de publications'}
                    </Button>
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="text-center text-sm text-zinc-400 py-4">
                    Vous êtes à jour !
                </div>
            )}
        </div>
    )
}
