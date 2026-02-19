import { fetchNotifications } from '@/app/actions'
import { NotificationsList } from '@/components/notifications-list'
import { Bell } from 'lucide-react'

export default async function NotificationsPage() {
    const notifications = await fetchNotifications()

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Bell className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Notifications
                </h1>
            </div>

            <NotificationsList initialNotifications={notifications} />
        </div>
    )
}
