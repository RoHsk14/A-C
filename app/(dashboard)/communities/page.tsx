
import { fetchCommunities } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Users, ArrowRight } from 'lucide-react'

export default async function CommunitiesPage() {
    const communities = await fetchCommunities()

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2">Vos Communautés</h1>
            <p className="text-muted-foreground mb-8">
                Sélectionnez une communauté pour accéder à ses espaces et contenus.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.length > 0 ? (
                    communities.map((community: any) => (
                        <Link href={`/c/${community.slug}`} key={community.id} className="group">
                            <Card className="h-full hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-500 overflow-hidden">
                                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                                    {community.logo_url && (
                                        <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl border-4 border-white dark:border-zinc-900 bg-white shadow-md overflow-hidden">
                                            <Image
                                                src={community.logo_url}
                                                alt={community.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    {!community.logo_url && (
                                        <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl border-4 border-white dark:border-zinc-900 bg-white shadow-md flex items-center justify-center text-indigo-600 font-bold text-2xl">
                                            {community.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="pt-10 pb-2">
                                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                                        {community.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                        {community.description || "Une communauté incroyable sur AfroCircle."}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-zinc-500">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-1.5" />
                                            {community.members_count || 0} membres
                                        </div>
                                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform p-0 bg-transparent hover:bg-transparent text-indigo-600">
                                            Accéder <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <Users className="w-12 h-12 text-zinc-300 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Aucune communauté</h3>
                        <p className="text-zinc-500 mb-6 text-center max-w-sm">
                            Vous n'avez rejoint aucune communauté pour le moment.
                        </p>
                        <Link href="/explore">
                            <Button>Explorer les communautés</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
