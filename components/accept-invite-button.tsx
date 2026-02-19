'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { acceptInvitation } from '@/app/invite/[token]/actions' // Adjust import path
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export function AcceptInviteButton({ token }: { token: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAccept = async () => {
        setLoading(true)
        try {
            const result = await acceptInvitation(token)
            if (result.error) {
                toast.error(result.error)
            } else if (result.success && result.slug) {
                toast.success('Bienvenue dans la communauté ! 🎉')
                router.push(`/dashboard`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Une erreur est survenue.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            className="w-full h-11 text-base"
            size="lg"
            disabled={loading}
            onClick={handleAccept}
            variant="brand"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                </>
            ) : (
                <>
                    Rejoindre la communauté
                    <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </Button>
    )
}
