import { getReportedPosts } from '../actions'
import { ModerationQueue } from '@/components/admin/moderation-queue'

export default async function AdminModerationPage() {
    const reports = await getReportedPosts()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    File de Modération
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Gérer les signalements de contenu
                </p>
            </div>

            {/* Moderation Queue */}
            <ModerationQueue initialReports={reports} />
        </div>
    )
}
