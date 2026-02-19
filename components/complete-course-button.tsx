'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { completeCourse } from '@/app/(dashboard)/courses/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CompleteCourseButtonProps {
    courseId: string
    courseSlug: string
}

export function CompleteCourseButton({ courseId, courseSlug }: CompleteCourseButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(false)

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            await completeCourse(courseId, courseSlug)
            toast.success('🎉 Félicitations ! Vous avez terminé le cours !', {
                description: 'Votre progression a été enregistrée.'
            })
            startTransition(() => {
                router.refresh()
            })
        } catch (error: any) {
            toast.error('Erreur', {
                description: error.message || 'Impossible de finaliser le cours'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleComplete}
            disabled={isLoading || isPending}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
            {isLoading || isPending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finalisation...
                </>
            ) : (
                <>
                    <Check className="w-4 h-4" />
                    Terminer le cours
                </>
            )}
        </Button>
    )
}
