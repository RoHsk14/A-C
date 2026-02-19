'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Rocket, PartyPopper } from 'lucide-react'
import { completeOnboarding } from '@/app/(dashboard)/courses/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface OnboardingModalProps {
    courseId: string
    courseTitle: string
    welcomeMessage?: string
    accentColor?: string
}

export function OnboardingModal({
    courseId,
    courseTitle,
    welcomeMessage,
    accentColor
}: OnboardingModalProps) {
    const [open, setOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleComplete = async () => {
        setLoading(true)
        try {
            await completeOnboarding(courseId)
            setOpen(false)
            toast.success("Bonne formation ! 🚀")
            router.refresh()
        } catch (error) {
            toast.error("Une erreur est survenue")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleComplete()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <PartyPopper className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <DialogTitle className="text-center text-xl">Bienvenue dans {courseTitle} !</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {welcomeMessage || "Nous sommes ravis de vous compter parmi nous. Préparez-vous à apprendre de nouvelles compétences !"}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Par où commencer ?</p>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Regardez la vidéo d'introduction</li>
                            <li>Rejoignez l'espace de discussion</li>
                            <li>Posez vos questions aux formateurs</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleComplete}
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[150px]"
                        style={accentColor ? { backgroundColor: accentColor } : undefined}
                    >
                        {loading ? 'Chargement...' : "C'est parti ! 🚀"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
