'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { joinCourse } from '@/app/(dashboard)/courses/actions'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface JoinCourseButtonProps {
    courseId: string
    courseSlug: string
    price: number
    currency?: string
}

export function JoinCourseButton({ courseId, courseSlug, price, currency = 'XOF' }: JoinCourseButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleJoin = async () => {
        setLoading(true)
        try {
            if (price > 0) {
                // Handle payment redirect here if needed, or just show message
                toast.info("Redirection vers le paiement...")
                // router.push(`/checkout/${courseId}`) // Example
                // For now, since we haven't implemented checkout flow in this component:
                return
            }

            await joinCourse(courseId, courseSlug)
            toast.success("Vous avez rejoint la formation !")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    if (price > 0) {
        return (
            <Button
                onClick={handleJoin} // Or link to checkout
                className="w-full h-12 text-base font-semibold"
                size="lg"
                variant="brand"
            >
                {/* We assume checkout is handled via a Link usually, but if we want valid button: */}
                Acheter pour {price.toLocaleString()} {currency}
            </Button>
        )
    }

    return (
        <Button
            onClick={handleJoin}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
            size="lg"
            variant="brand"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Rejoindre gratuitement"}
        </Button>
    )
}
