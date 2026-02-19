import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PlusCircle, Hash, Globe, Lock, ChevronLeft, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'

export default async function CommunityDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()


    // Fetch community and its spaces in one query
    const { data: community } = await supabase
        .from('communities')
        .select(`
            *,
            spaces:spaces(
                *,
                members:space_members(count)
            )
        `)
        .eq('slug', slug)
        .order('name', { referencedTable: 'spaces', ascending: true })
        .single()

    if (!community) {
        notFound()
    }

    const spaces = community.spaces

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link href="/creator/communities">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Retour aux communautés
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {community.name}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                            {community.description || "Gérez les espaces de cette communauté."}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/creator/communities/${slug}/settings`}>
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                Paramètres
                            </Button>
                        </Link>
                        <Link href={`/creator/communities/${slug}/spaces/create`}>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un Espace
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Spaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(spaces || []).length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                        <Hash className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Aucun espace
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
                            Ajoutez des espaces de discussion à votre communauté.
                        </p>
                        <Link href={`/creator/communities/${slug}/spaces/create`}>
                            <Button variant="outline">
                                Ajouter un espace
                            </Button>
                        </Link>
                    </div>
                ) : (
                    spaces!.map((space: any) => (
                        <Card key={space.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-24 bg-zinc-100 dark:bg-zinc-800 relative p-4 flex items-center justify-center">
                                <Hash className="h-8 w-8 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                <div className="absolute top-2 right-2">
                                    <Badge variant={space.is_private ? "secondary" : "outline"} className="bg-white/50 backdrop-blur-sm">
                                        {space.is_private ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                                        {space.is_private ? 'Privé' : 'Public'}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold line-clamp-1">{space.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-10">
                                    {space.description || "Aucune description."}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-400">
                                        {space.members?.[0]?.count || 0} membres
                                    </span>
                                    <Link href={`/creator/communities/${slug}/spaces/${space.slug}/settings`}>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                                            Gérer
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
