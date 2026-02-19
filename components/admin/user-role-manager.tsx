'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, ShieldAlert, User } from 'lucide-react'
import { updateUserRole } from '@/app/(dashboard)/admin/users/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserRoleManagerProps {
    userId: string
    currentRole: 'user' | 'admin'
    userName: string
}

export function UserRoleManager({ userId, currentRole, userName }: UserRoleManagerProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRoleChange = async (newRole: 'user' | 'admin') => {
        if (loading) return
        setLoading(true)
        try {
            await updateUserRole(userId, newRole)
            toast.success(`Rôle de ${userName} mis à jour : ${newRole}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la mise à jour du rôle")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Ouvrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => handleRoleChange('admin')}
                    disabled={currentRole === 'admin' || loading}
                    className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Promouvoir Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRoleChange('user')}
                    disabled={currentRole === 'user' || loading}
                >
                    <User className="mr-2 h-4 w-4" />
                    Rétrograder Utilisateur
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
