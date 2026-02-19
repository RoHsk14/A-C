
'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RightSidebar } from './right-sidebar' // We will need to adapt this or use it differently
// Since RightSidebar is async server component, we can't import it directly into client component easily unless passed as children.
// Revised plan: separate the Widget components (OnlineMembers, Events) into client or server components we can fetch data for.
// Actually, let's keep it simple: 
// SmartRightSidebarClient just determines context and renders CHILDREN passed from layout? 
// No, layout can't pass children based on query params.
// So SmartRightSidebarClient MUST fetch data itself.

import { Card, CardContent } from '@/components/ui/card'
import { getSidebarData } from '@/app/actions'
import { Users, Calendar, Link as LinkIcon, ExternalLink, Clock, PlayCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SmartRightSidebar({ userIdentity, className }: { userIdentity: React.ReactNode, className?: string }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const spaceId = searchParams.get('space')

    // Determine Context
    const isCourse = pathname?.startsWith('/courses/')
    const isProfile = pathname === '/profile' || pathname === '/settings'
    const isCommunity = !!spaceId

    const [data, setData] = useState<any>({ members: [], events: [], modules: [] })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Fetch data based on context
                // We'll create a server action that handles all logic
                const result = await getSidebarData(spaceId || undefined, isCourse ? pathname : undefined)
                setData(result)
            } catch (error) {
                console.error("Failed to fetch sidebar data", error)
            } finally {
                setLoading(false)
            }
        }

        if (isCommunity || isCourse) {
            fetchData()
        } else {
            // Global/Personal dashboard
            // Fetch global events maybe?
            fetchData()
        }
    }, [spaceId, pathname, isCourse])

    return (
        <aside className={cn("w-80 hidden xl:block border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 h-screen sticky top-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800", className)}>
            {userIdentity}

            <div className="space-y-6 mt-6">
                {/* Course Context */}
                {isCourse && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" />
                            Progression Cours
                        </h3>
                        <div className="space-y-2 mt-3">
                            {/* Mock modules for now if real data not fully ready */}
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                {data.modules?.length > 0 ? (
                                    data.modules.map((m: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-white/50">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                            <span className="truncate">{m.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>Chargement du plan de cours...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Community Context & Global (Events/Members) */}
                {/* Members Widget */}
                {(isCommunity || !isCourse) && (
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                            <div className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                <Users className="w-4 h-4 text-emerald-500" />
                                {isCommunity ? "Membres du salon" : "Membres en ligne"}
                            </div>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                {data.members?.length || 0}
                            </Badge>
                        </div>
                        <CardContent className="pt-4">
                            <div className="flex -space-x-2 overflow-hidden mb-4 p-1">
                                {data.members?.slice(0, 5).map((member: any) => (
                                    <div key={member.id} className="relative group">
                                        <Avatar className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-zinc-900 transition-transform group-hover:-translate-y-1">
                                            <AvatarImage src={member.avatar_url} />
                                            <AvatarFallback>{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-emerald-500" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                {data.members?.length > 0 ? "Vos amis sont ici !" : "Soyez le premier à rejoindre !"}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Events Widget */}
                {(isCommunity || !isCourse) && (
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                            <div className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                Événements
                            </div>
                        </div>
                        <CardContent className="pt-4 space-y-3">
                            {data.events?.length > 0 ? data.events.map((event: any) => {
                                const date = new Date(event.start_time)
                                const day = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                                const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                return (
                                    <div key={event.id} className="group flex items-start gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-zinc-900/50">
                                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border shrink-0 bg-indigo-50 text-indigo-600 border-indigo-100`}>
                                            <span className="text-[10px] uppercase font-bold text-center leading-tight">{day}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{event.title}</h4>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {time} • {event.type}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <p className="text-xs text-muted-foreground text-center">Aucun événement prévu.</p>
                            )}
                            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary h-8 mt-2">
                                Voir tout le calendrier
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Resources Widget (Static) */}
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                        <div className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                            <LinkIcon className="w-4 h-4 text-slate-500" />
                            Ressources
                        </div>
                    </div>
                    <CardContent className="pt-2 p-0">
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            <Link href="#" className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-primary">Guide de démarrage</span>
                                <ExternalLink className="w-3 h-3 text-zinc-300" />
                            </Link>
                            <Link href="#" className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-primary">Bibliothèque</span>
                                <ExternalLink className="w-3 h-3 text-zinc-300" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </aside>
    )
}
