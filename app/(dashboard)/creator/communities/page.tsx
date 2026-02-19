import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PlusCircle, Users, Layers, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function CreatorCommunitiesPage() {
    const supabase = await createClient()

    // Check role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    // Fetch communities created by user (or all if admin?)
    // Usually creators manage their own communities. Admin can manage all.
    let query = supabase
        .from('communities')
        .select(`
            id, 
            name, 
            slug, 
            description, 
            created_at,
            members:community_members(count),
            spaces:spaces(count)
        `)
        .order('created_at', { ascending: false })

    if (!isAdmin) {
        query = query.eq('creator_id', user.id)
    }

    const { data: communities } = await query

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Mes Communautés
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Gérez vos communautés et leurs espaces
                    </p>
                </div>
                <Link href="/creator/communities/create">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 ml-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouvelle Communauté
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(communities || []).length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                        <Users className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Aucune communauté
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
                            Créez votre première communauté pour rassembler vos membres.
                        </p>
                        <Link href="/creator/communities/create">
                            <Button variant="outline">
                                Créer une communauté
                            </Button>
                        </Link>
                    </div>
                ) : (
                    communities!.map((community: any) => (
                        <Card key={community.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative p-6 flex items-center justify-center">
                                <Users className="h-12 w-12 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{community.name}</CardTitle>
                                <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 gap-4 mt-2">
                                    <span className="flex items-center" title="Membres">
                                        <Users className="h-4 w-4 mr-1" />
                                        {community.members?.[0]?.count || 0}
                                    </span>
                                    <span className="flex items-center" title="Espaces">
                                        <Layers className="h-4 w-4 mr-1" />
                                        {community.spaces?.[0]?.count || 0} espaces
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-6 h-10">
                                    {community.description || "Aucune description."}
                                </p>
                                <div className="flex gap-2">
                                    <Link href={`/creator/communities/${community.slug}`} className="w-full">
                                        <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                                            <Layers className="mr-2 h-4 w-4" />
                                            Gérer les espaces
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
