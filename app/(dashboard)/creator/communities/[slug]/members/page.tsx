import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Mail, Calendar, Hash, Users, Shield } from 'lucide-react'
import Link from 'next/link'
import { InviteMemberModal } from '@/components/invite-member-modal'



export default async function CommunityMembersPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { slug } = params

    // 1. Verify Access & Fetch Community
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return notFound()

    const { data: community } = await supabase
        .from('communities')
        .select(`
            id, 
            name, 
            creator_id
        `)
        .eq('slug', slug)
        .single()

    if (!community) return notFound()

    // Check if user is creator or admin 
    // (Actually, members page could be visible to all members? 
    // Title says "Gérez les accès". If management, only admin. 
    // If just viewing list, maybe all?
    // Let's assume this is the Creator Dashboard view, so management focus.)

    const { data: currentUserMember } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', community.id)
        .eq('user_id', user.id)
        .single()

    // Allow creator (owner) and admins
    const isCreator = community.creator_id === user.id
    const isAdmin = currentUserMember?.role === 'admin'

    if (!isCreator && !isAdmin) {
        return (
            <div className="p-8 text-center text-red-600">
                Vous n'êtes pas autorisé à gérer les membres de cette communauté.
            </div>
        )
    }

    // 2. Fetch Members
    const { data: members } = await supabase
        .from('community_members')
        .select(`
            id,
            role,
            joined_at,
            user:profiles!community_members_user_id_fkey (
                id,
                name,
                email,
                avatar_url
            )
        `)
        .eq('community_id', community.id)
        .neq('role', 'banned') // Optionally hide banned or show them? Previous list showed them.
        .order('joined_at', { ascending: false })

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Membres de la Communauté</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Users className="h-4 w-4" />
                        <span>{community.name}</span>
                        <span>•</span>
                        <span>{members?.length || 0} membre(s)</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/creator/communities/${slug}`}>
                        <Button variant="outline">Retour</Button>
                    </Link>
                    <InviteMemberModal
                        communityId={community.id}
                        trigger={
                            <Button variant="brand">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Inviter un membre
                            </Button>
                        }
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des membres</CardTitle>
                    <CardDescription>
                        Vue d'ensemble des membres de la communauté. Pour gérer les rôles, allez dans les paramètres.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {(members || []).length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
                                Aucun membre pour le moment.
                            </p>
                        ) : (
                            members!.map((member: any) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border border-zinc-200">
                                            <AvatarImage src={member.user?.avatar_url} />
                                            <AvatarFallback>{member.user?.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{member.user?.name || 'Inconnu'}</p>
                                                {member.role === 'admin' && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Admin
                                                    </Badge>
                                                )}
                                                {member.role === 'moderator' && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 h-5 text-indigo-600 border-indigo-200">Modérateur</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <span className="flex items-center">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {member.user?.email}
                                                </span>
                                                <span className="hidden md:flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Rejoint le {new Date(member.joined_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-zinc-400">
                                            {member.role === 'member' && 'Membre'}
                                            {member.role === 'admin' && 'Administrateur'}
                                            {member.role === 'moderator' && 'Modérateur'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
