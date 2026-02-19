import { getAuditLogs } from '../actions'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, Shield, Trash2, AlertTriangle, UserCog } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function AdminLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; action?: string }>
}) {
    const { page: pageParam, action: actionFilter } = await searchParams
    const page = parseInt(pageParam || '1')

    const { logs, total, pages } = await getAuditLogs(page, 50, actionFilter)

    const getActionIcon = (action: string) => {
        if (action.includes('delete')) return Trash2
        if (action.includes('role')) return UserCog
        if (action.includes('warn')) return AlertTriangle
        return Shield
    }

    const getActionColor = (action: string) => {
        if (action.includes('delete')) return 'text-red-600 dark:text-red-400'
        if (action.includes('role')) return 'text-blue-600 dark:text-blue-400'
        if (action.includes('warn')) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-indigo-600 dark:text-indigo-400'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Logs d'Activité
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Historique des actions administratives
                </p>
            </div>

            {/* Timeline */}
            <Card className="p-6">
                {logs.length === 0 ? (
                    <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                        Aucun log disponible
                    </p>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log: any) => {
                            const Icon = getActionIcon(log.action)
                            const colorClass = getActionColor(log.action)

                            return (
                                <div key={log.id} className="flex gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                                    {/* Icon */}
                                    <div className={`h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={log.admin?.avatar_url} />
                                                    <AvatarFallback className="text-xs">
                                                        {log.admin?.name?.[0]?.toUpperCase() || 'A'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {log.admin?.name || 'Admin'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(log.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <Badge variant="outline" className="mb-2">
                                                {log.action}
                                            </Badge>
                                            {log.target_type && (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    Cible: {log.target_type} ({log.target_id?.slice(0, 8)}...)
                                                </p>
                                            )}
                                            {log.details && (
                                                <details className="mt-2">
                                                    <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
                                                        Voir les détails
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded text-xs overflow-x-auto">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Card>

            {/* Pagination Info */}
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Total: {total} log{total !== 1 ? 's' : ''} • Page {page} sur {pages}
            </div>
        </div>
    )
}
