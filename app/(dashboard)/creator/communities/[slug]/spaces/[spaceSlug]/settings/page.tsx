import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SpaceSettingsForm } from '@/components/admin/space-settings-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SpaceSettingsPage({ params }: { params: { slug: string, spaceSlug: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { slug, spaceSlug } = params

    // 1. Fetch Community & Space & Verify Access
    const { data: community } = await supabase
        .from('communities')
        .select('id, slug, creator_id')
        .eq('slug', slug)
        .single()

    if (!community) notFound()

    const { data: space } = await supabase
        .from('spaces')
        .select('*')
        .eq('slug', spaceSlug)
        .eq('community_id', community.id)
        .single()

    if (!space) notFound()

    // Access Check: Admin of Space OR Creator of Community
    const { data: spaceMember } = await supabase
        .from('space_members')
        .select('role')
        .eq('space_id', space.id)
        .eq('user_id', user.id)
        .single()

    const isCommunityCreator = community.creator_id === user.id
    const isSpaceAdmin = spaceMember?.role === 'admin'

    if (!isCommunityCreator && !isSpaceAdmin) {
        redirect(`/creator/communities/${slug}`)
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/creator/communities/${slug}`}>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Paramètres de l'espace
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Gérez l'espace {space.name}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        Modifiez les informations, le style et la confidentialité de l'espace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SpaceSettingsForm space={space} communitySlug={slug} />
                </CardContent>
            </Card>
        </div>
    )
}
