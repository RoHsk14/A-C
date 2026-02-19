'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useRealtimeNotifications(onNotification: (notification: any) => void) {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            console.log('Setting up realtime subscription for user:', user.id)

            const channel = supabase
                .channel('realtime-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('New notification received:', payload)
                        onNotification(payload.new)
                        toast.info('Nouvelle notification : ' + payload.new.title)
                        router.refresh()
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        setupSubscription()
    }, [supabase, router, onNotification])
}
