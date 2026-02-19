import { getCommunities } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Globe, Users, Building2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export default async function AdminCommunitiesPage() {
    const communities = await getCommunities()

    // Calculate stats
    const totalCommunities = communities.length
    const totalMembers = communities.reduce((sum: number, c: any) => sum + (c.members?.[0]?.count || 0), 0)
    const totalSpaces = communities.reduce((sum: number, c: any) => sum + (c.spaces?.[0]?.count || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Gestion des Communautés
                </h1>
                <p className="text-slate-500 mt-1">
                    Vue d'ensemble de toutes les communautés de la plateforme
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Communautés
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {totalCommunities}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Membres
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {totalMembers}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Espaces
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {totalSpaces}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Communities Table */}
            <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Communauté
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Créateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Membres
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Espaces
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {communities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Aucune communauté trouvée
                                    </td>
                                </tr>
                            ) : (
                                communities.map((community: any) => (
                                    <tr key={community.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-bold text-lg">
                                                        {community.name?.[0]?.toUpperCase() || 'C'}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-900 truncate">
                                                        {community.name}
                                                    </div>
                                                    {community.description && (
                                                        <div className="text-sm text-slate-500 truncate">
                                                            {community.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 border border-slate-200">
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-medium">
                                                        {community.creator?.name?.[0]?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-slate-600">
                                                    {community.creator?.name || 'Inconnu'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <Users className="h-4 w-4" />
                                                <span className="font-medium">{community.members?.[0]?.count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <Building2 className="h-4 w-4" />
                                                <span className="font-medium">{community.spaces?.[0]?.count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {format(new Date(community.created_at), 'dd MMM yyyy', { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/creator/communities/${community.slug}`} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        Voir
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Summary */}
            {communities.length > 0 && (
                <div className="text-sm text-slate-500">
                    Total: {communities.length} communautés
                </div>
            )}
        </div>
    )
}
