'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function NotificationBadge() {
    const [count, setCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const fetchCount = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { count: unreadCount } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false)

            setCount(unreadCount || 0)

            // Subscribe to new notifications
            const channel = supabase
                .channel('notifications-count')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setCount((prev) => prev + 1)
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        fetchCount()
    }, [])

    if (count === 0) return null

    return (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
            {count > 99 ? '99+' : count}
        </span>
    )
}
