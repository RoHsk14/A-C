'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PlusCircle, Loader2 } from 'lucide-react'
import { createManualEnrollment } from '@/app/(dashboard)/admin/enrollments/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    users: { id: string, name: string, email: string }[]
    courses: { id: string, title: string }[]
}

export function ManualEnrollmentDialog({ users, courses }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedCourse, setSelectedCourse] = useState('')
    const router = useRouter()

    const handleSubmit = async () => {
        if (!selectedUser || !selectedCourse) return

        setLoading(true)
        try {
            await createManualEnrollment(selectedUser, selectedCourse)
            toast.success("Inscription manuelle créée avec succès")
            setOpen(false)
            setSelectedUser('')
            setSelectedCourse('')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de l'inscription")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle Inscription
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Inscription Manuelle</DialogTitle>
                    <DialogDescription>
                        Ajoutez manuellement un élève à un cours. L'accès sera immédiat.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Utilisateur</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un utilisateur" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Cours</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un cours" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedUser || !selectedCourse}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Inscrire
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
