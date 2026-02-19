'use client'

import { useState } from 'react'
import { AlertTriangle, Check, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveReport, deleteReportedContent } from '@/app/actions'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'

interface ReportItemProps {
    report: {
        id: string
        reason: string
        created_at: string
        reporter: { name: string } | null
        post: { content: string } | null
        comment: { content: string } | null
        resource_id: string
        resource_type: string
    }
}

export function ReportItem({ report }: ReportItemProps) {
    const [loading, setLoading] = useState(false)

    const handleResolve = async () => {
        setLoading(true)
        try {
            await resolveReport(report.id)
            toast.success('Signalement ignoré/résolu')
        } catch (error) {
            toast.error('Erreur')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return

        setLoading(true)
        try {
            await deleteReportedContent(report.id, report.resource_id, report.resource_type as any)
            toast.success('Contenu supprimé')
        } catch (error) {
            toast.error('Erreur')
        } finally {
            setLoading(false)
        }
    }

    // Fix props access
    const content = report.post?.content || report.comment?.content || "Contenu introuvable"
    const resourceId = report.resource_id
    const resourceType = report.resource_type

    return (
        <div className="flex gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
            <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            {report.reason}
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-normal text-zinc-500 capitalize">
                                {resourceType}
                            </span>
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">
                            Signalé par {report.reporter?.name || 'Inconnu'} • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: fr })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            onClick={handleResolve}
                            disabled={loading}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Ignorer
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 relative group">
                    <div
                        className="prose prose-sm prose-indigo dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                    {resourceType === 'post' && (
                        <Link href={`/dashboard?post=${resourceId}`} target="_blank" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded shadow-sm">
                            <ExternalLink className="w-4 h-4 text-zinc-400" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
