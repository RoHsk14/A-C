import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Link as LinkIcon, ExternalLink, Clock, Rocket, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export async function RightSidebar({ spaceId }: { spaceId?: string }) {
    const supabase = await createClient()

    // 1. Fetch Members (Only if inside a space)
    let members: any[] = []
    if (spaceId) {
        const { data } = await supabase
            .from('space_members')
            .select('profile:profiles(id, name, avatar_url)')
            .eq('space_id', spaceId)
            .limit(10)
        members = data || []
    }

    // 2. Fetch Events
    let events = []

    if (spaceId) {
        // Specific Community Events
        const { data: space } = await supabase.from('spaces').select('community_id').eq('id', spaceId).single()
        if (space?.community_id) {
            const { data } = await supabase
                .from('events')
                .select('*')
                .eq('community_id', space.community_id)
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(3)
            events = data || []
        }
    } else {
        // Global Dashboard: Fetch all future events (or from user's communities in a real app)
        const { data } = await supabase
            .from('events')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3)
        events = data || []
    }

    return (
        <div className="space-y-6">
            {spaceId && <OnlineMembersWidget members={members.map((m: any) => m.profile)} />}
            <EventsWidget events={events} />
            <ResourcesWidget />
        </div>
    )
}

function OnlineMembersWidget({ members }: { members: any[] }) {
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Membres du salon
                    </CardTitle>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {members.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex -space-x-2 overflow-hidden mb-4 p-1">
                    {members.slice(0, 5).map((member) => (
                        <div key={member.id} className="relative group">
                            <Avatar className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-zinc-900 transition-transform group-hover:-translate-y-1">
                                <AvatarImage src={member.avatar_url} />
                                <AvatarFallback>{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {/* Simulate online status randomly for demo purposes or use real presence if available later */}
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-emerald-500`} />
                        </div>
                    ))}
                    {members.length > 5 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 hover:bg-zinc-200 cursor-pointer transition-colors">
                            +{members.length - 5}
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    {members.length > 0 ? "Vos amis sont ici !" : "Soyez le premier à rejoindre !"}
                </p>
            </CardContent>
        </Card>
    )
}

function EventsWidget({ events }: { events: any[] }) {
    if (events.length === 0) {
        return (
            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        Événements
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-center text-xs text-muted-foreground">
                    Aucun événement prévu pour le moment.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        Événements à venir
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                {events.map((event) => {
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
                })}
            </CardContent>
        </Card>
    )
}

function ResourcesWidget() {
    const resources = [
        { id: 1, name: "Guide de démarrage", icon: Rocket },
        { id: 2, name: "Bibliothèque de cours", icon: LinkIcon },
        { id: 3, name: "Règles de la communauté", icon: ShieldCheck },
    ]

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <LinkIcon className="w-4 h-4 text-slate-500" />
                        Ressources Clés
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-2 p-0">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {resources.map((resource) => (
                        <Link
                            key={resource.id}
                            href="#"
                            className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-primary group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                    <resource.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-primary transition-colors">
                                    {resource.name}
                                </span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-zinc-300 group-hover:text-primary transition-colors" />
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}


