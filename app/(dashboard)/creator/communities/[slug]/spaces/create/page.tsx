import { CreateSpaceForm } from '@/components/admin/create-space-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function CreateCommunitySpacePage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient()
    const { slug } = await params


    // Fetch community to get ID
    const { data: community } = await supabase
        .from('communities')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

    if (!community) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div>
                <Link href={`/creator/communities/${slug}`}>
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Retour à {community.name}
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Ajouter un espace
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Créez un nouvel espace de discussion dans la communauté <strong>{community.name}</strong>.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <CreateSpaceForm communityId={community.id} communitySlug={community.slug} />
            </div>
        </div>
    )
}
