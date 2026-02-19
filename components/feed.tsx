import { fetchPosts } from '@/app/actions'
import { FeedList } from '@/components/feed-list'
import { Card, CardContent } from '@/components/ui/card'

interface FeedProps {
    communityId?: string
    spaceId?: string
}

export async function Feed({ communityId, spaceId }: FeedProps) {
    const posts = await fetchPosts(0, 20, spaceId, communityId)

    if (posts.length === 0) {
        return (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Aucun post pour le moment. Soyez le premier à publier !
                    </p>
                </CardContent>
            </Card>
        )
    }

    return <FeedList initialPosts={posts} spaceId={spaceId} />
}
