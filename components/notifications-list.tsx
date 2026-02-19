'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, MessageCircle, User, ShieldAlert, BookOpen, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markAllNotificationsAsRead } from '@/app/actions'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    is_read: boolean
    created_at: string
}

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || [])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setNotifications(initialNotifications || [])
    }, [initialNotifications])

    useRealtimeNotifications((newNotification) => {
        setNotifications((prev) => [newNotification, ...prev])
    })

    const handleMarkAllRead = async () => {
        setLoading(true)
        try {
            await markAllNotificationsAsRead()
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        } catch (error) {
            console.error('Error marking read', error)
        } finally {
            setLoading(false)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    const getIcon = (type: string) => {
        switch (type) {
            case 'system_alert':
                return <ShieldAlert className="w-5 h-5 text-red-500" />
            case 'new_lesson':
            case 'course_update':
                return <BookOpen className="w-5 h-5 text-indigo-500" />
            case 'post_like':
                return <ThumbsUp className="w-5 h-5 text-blue-500" />
            case 'comment':
            case 'comment_reply':
                return <MessageCircle className="w-5 h-5 text-green-500" />
            case 'mention':
                return <span className="text-xl">@</span>
            default:
                return <Bell className="w-5 h-5 text-zinc-500" />
        }
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Bell className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">Aucune notification pour le moment</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        disabled={loading}
                        className="text-zinc-500 hover:text-indigo-600"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Tout marquer comme lu
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={cn(
                            "flex gap-4 p-4 rounded-xl transition-all border",
                            notification.is_read
                                ? "bg-white dark:bg-zinc-900 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                                : "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30"
                        )}
                    >
                        {/* Icon/Avatar Placeholder */}
                        <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                {getIcon(notification.type)}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">
                                {notification.title}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {notification.message}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-xs text-zinc-400">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                </p>

                                {notification.link && (
                                    <Link
                                        href={notification.link}
                                        className='text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline'
                                    >
                                        Voir le contenu
                                    </Link>
                                )}
                            </div>
                        </div>

                        {!notification.is_read && (
                            <div className="shrink-0 self-center">
                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
