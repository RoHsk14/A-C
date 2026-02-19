'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { handleReport } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ModerationQueueProps {
    initialReports: any[]
}

export function ModerationQueue({ initialReports }: ModerationQueueProps) {
    const router = useRouter()
    const [loadingReportId, setLoadingReportId] = useState<string | null>(null)
    const [adminNote, setAdminNote] = useState<{ [key: string]: string }>({})

    const handleAction = async (reportId: string, action: 'ignore' | 'delete' | 'warn') => {
        setLoadingReportId(reportId)
        try {
            await handleReport(reportId, action, adminNote[reportId])
            toast.success(
                action === 'ignore' ? 'Signalement ignoré' :
                    action === 'delete' ? 'Post supprimé' :
                        'Avertissement envoyé'
            )
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors du traitement')
        } finally {
            setLoadingReportId(null)
        }
    }

    if (initialReports.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        Aucun signalement en attente
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Tous les signalements ont été traités
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {initialReports.map((report: any) => (
                <Card key={report.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={report.reporter?.avatar_url} />
                                    <AvatarFallback>
                                        {report.reporter?.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                        Signalé par {report.reporter?.name || 'Utilisateur'}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {format(new Date(report.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Signalement
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Reason */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                Motif du signalement
                            </h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {report.reason}
                            </p>
                        </div>

                        {/* Post Content */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={report.post?.author?.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                        {report.post?.author?.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {report.post?.author?.name || 'Utilisateur'}
                                </span>
                            </div>
                            <div
                                className="text-sm text-zinc-600 dark:text-zinc-400 prose prose-sm prose-indigo dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0"
                                dangerouslySetInnerHTML={{ __html: report.post?.content || '' }}
                            />
                        </div>

                        {/* Admin Note */}
                        <div>
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                                Note admin (optionnel)
                            </label>
                            <Textarea
                                placeholder="Ajouter une note interne..."
                                value={adminNote[report.id] || ''}
                                onChange={(e) => setAdminNote({ ...adminNote, [report.id]: e.target.value })}
                                className="resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleAction(report.id, 'ignore')}
                                disabled={loadingReportId === report.id}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Ignorer
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleAction(report.id, 'warn')}
                                disabled={loadingReportId === report.id}
                            >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Avertir l'auteur
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleAction(report.id, 'delete')}
                                disabled={loadingReportId === report.id}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Supprimer le post
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
