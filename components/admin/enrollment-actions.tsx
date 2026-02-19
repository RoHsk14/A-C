'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Ban, Trash2 } from 'lucide-react'
import { cancelEnrollment } from '@/app/(dashboard)/admin/enrollments/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EnrollmentActionsProps {
    enrollmentId: string
    status: string
    userName: string
}

export function EnrollmentActions({ enrollmentId, status, userName }: EnrollmentActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        if (loading) return
        if (!confirm(`Voulez-vous vraiment révoquer l'accès de ${userName} ?`)) return

        setLoading(true)
        try {
            await cancelEnrollment(enrollmentId)
            toast.success("Inscription révoquée avec succès")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la révocation")
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
                    onClick={handleCancel}
                    disabled={status === 'cancelled' || loading}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                    <Ban className="mr-2 h-4 w-4" />
                    Révoquer l'accès
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
