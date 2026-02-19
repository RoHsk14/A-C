import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Crown } from 'lucide-react'

async function getSpaceMembers(spaceId: string) {
    const supabase = await createClient()

    const { data: members } = await supabase
        .from('space_members')
        .select(`
            id,
            role,
            created_at,
            profile:profiles(id, name, avatar_url, role)
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false })
        .limit(10)

    return members || []
}

export async function MembersList({ spaceId }: { spaceId?: string }) {
    if (!spaceId) return null

    const members = await getSpaceMembers(spaceId)

    if (members.length === 0) return null

    return (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Membres Récents
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {members.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.profile?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                    {member.profile?.name?.[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {member.profile?.name || 'Utilisateur'}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">
                                    {new Date(member.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            {member.role === 'admin' && (
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                                    <Crown className="w-3 h-3 mr-0.5" />
                                    Admin
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
