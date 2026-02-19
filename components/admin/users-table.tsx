'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Shield, User, Ban, Mail, Loader2, Eye } from 'lucide-react'
import { updateUserRole, toggleUserStatus, sendPasswordReset } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface UsersTableProps {
    initialUsers: Array<{
        id: string
        name: string
        email: string
        role: string
        created_at: string
        avatar_url: string | null
    }>
    initialTotal: number
    initialPage: number
}

export function UsersTable({ initialUsers, initialTotal, initialPage }: UsersTableProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (roleFilter !== 'all') params.set('role', roleFilter)
        router.push(`/admin/users?${params.toString()}`)
    }

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'creator' | 'member') => {
        setLoadingUserId(userId)
        try {
            await updateUserRole(userId, newRole)
            toast.success('Rôle mis à jour')
            startTransition(() => {
                router.refresh()
            })
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la mise à jour')
        } finally {
            setLoadingUserId(null)
        }
    }

    const handleToggleStatus = async (userId: string) => {
        setLoadingUserId(userId)
        try {
            const result = await toggleUserStatus(userId)
            toast.success(result.newStatus === 'disabled' ? 'Compte désactivé' : 'Compte activé')
            startTransition(() => {
                router.refresh()
            })
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la modification')
        } finally {
            setLoadingUserId(null)
        }
    }

    const handlePasswordReset = async (email: string) => {
        try {
            await sendPasswordReset(email)
            toast.success('Email de réinitialisation envoyé')
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'envoi')
        }
    }

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { variant: any; color: string }> = {
            admin: { variant: 'default', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
            creator: { variant: 'secondary', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            member: { variant: 'outline', color: 'bg-slate-100 text-slate-700 border-slate-200' },
            banned: { variant: 'destructive', color: 'bg-red-100 text-red-700 border-red-200' }
        }
        const config = variants[role] || variants.member

        return (
            <Badge variant={config.variant} className={`capitalize ${config.color} border`}>
                {role}
            </Badge>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <Card className="p-4 rounded-2xl shadow-sm border-slate-200">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher par nom ou email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200 rounded-lg">
                            <SelectValue placeholder="Filtrer par rôle" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les rôles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                        Rechercher
                    </Button>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Rôle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Inscription
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {initialUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-slate-100">
                                                <AvatarImage src={user.avatar_url || undefined} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-slate-900">
                                                    {user.name || 'Sans nom'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Voir
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingUserId === user.id}>
                                                        {loadingUserId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MoreVertical className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Promouvoir Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'creator')}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        Définir Creator
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'member')}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        Définir Member
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handlePasswordReset(user.email)}>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        Réinitialiser MDP
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        {user.role === 'banned' ? 'Activer' : 'Désactiver'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Pagination Info */}
            <div className="text-sm text-slate-500">
                Total: {initialTotal} utilisateur{initialTotal !== 1 ? 's' : ''}
            </div>
        </div>
    )
}
