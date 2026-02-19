'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { togglePublish } from '@/app/(dashboard)/creator/actions'
import { Loader2, Globe, EyeOff } from 'lucide-react'

export function PublishButton({ courseId, isPublished }: { courseId: string, isPublished: boolean }) {
    const [loading, setLoading] = useState(false)

    const onClick = async () => {
        setLoading(true)
        try {
            await togglePublish(courseId, isPublished)
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la publication")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={onClick}
            disabled={loading}
            variant={isPublished ? "outline" : "brand"}
            className={isPublished ? "border-yellow-600 text-yellow-600 hover:bg-yellow-50" : ""}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isPublished ? (
                <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Passer en Brouillon
                </>
            ) : (
                <>
                    <Globe className="h-4 w-4 mr-2" />
                    Publier la formation
                </>
            )}
        </Button>
    )
}
