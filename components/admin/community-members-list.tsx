'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { removeMember, updateMemberRole } from '@/app/(dashboard)/creator/communities/actions'
import { toast } from 'sonner'
import { Loader2, Trash2, Shield, User } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Member {
    id: string
    user_id: string
    role: string
    joined_at: string
    profile: {
        name: string
        email: string
        avatar_url: string | null
    }
}

interface CommunityMembersListProps {
    communityId: string
    members: Member[]
    currentUserId: string
}

export function CommunityMembersList({ communityId, members, currentUserId }: CommunityMembersListProps) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleRemove = async (userId: string) => {
        setLoadingId(userId)
        try {
            await removeMember(communityId, userId)
            toast.success("Membre retiré.")
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors du retrait")
        } finally {
            setLoadingId(null)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingId(userId)
        try {
            await updateMemberRole(communityId, userId, newRole as 'admin' | 'member' | 'moderator')
            toast.success(`Rôle mis à jour : ${newRole}`)
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-medium text-lg">Membres ({members.length})</h3>
                {/* Could add invite button here */}
            </div>

            <div className="space-y-2">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={member.profile.avatar_url || undefined} />
                                <AvatarFallback>{member.profile.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{member.profile.name}</p>
                                <p className="text-xs text-zinc-500">{member.profile.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                {member.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                {member.role}
                            </Badge>

                            {/* Actions Dropdown (Only if not self, and current user is admin/creator) */}
                            {/* Assuming parent component passes capability or we rely on backend checks */}
                            {member.user_id !== currentUserId && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" disabled={loadingId === member.user_id}>
                                            {loadingId === member.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gérer'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'admin')}>
                                            Promouvoir Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'member')}>
                                            Rétrograder Membre
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRemove(member.user_id)} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Retirer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <p className="text-zinc-500 text-sm">Aucun membre.</p>
                )}
            </div>
        </div>
    )
}
