import { getStats, getAnalytics } from './actions'
import { StatsCard } from '@/components/admin/stats-card'
import { UserGrowthChart } from '@/components/admin/user-growth-chart'
import { PieChartCard } from '@/components/admin/pie-chart-card'
import { Users, UserPlus, Activity, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminOverviewPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: '7d' | '30d' | 'all' }>
}) {
    const { period: periodParam } = await searchParams
    const period = periodParam || '30d'

    // Fetch data in parallel
    const [stats, analyticsData] = await Promise.all([
        getStats(),
        getAnalytics(period)
    ])

    // Sample data for pie chart (you can replace with real data)
    const userDistribution = [
        { name: 'Membres', value: stats.totalMembers - stats.newMembers30d, color: '#4F46E5' },
        { name: 'Nouveaux', value: stats.newMembers30d, color: '#F97316' },
        { name: 'Actifs', value: stats.weeklyActivity, color: '#06B6D4' },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Dashboard
                </h1>
                <p className="text-slate-500 mt-1">
                    Vue d'ensemble de la plateforme
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Membres"
                    value={stats.totalMembers}
                    icon={Users}
                />
                <StatsCard
                    title="Nouveaux (30j)"
                    value={stats.newMembers30d}
                    icon={UserPlus}
                    trend={{
                        value: stats.percentageChange,
                        label: 'vs mois dernier'
                    }}
                />
                <StatsCard
                    title="Activité (7j)"
                    value={stats.weeklyActivity}
                    icon={Activity}
                />
                <StatsCard
                    title="Revenus"
                    value={`${stats.revenue} €`}
                    icon={DollarSign}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Croissance
                        </h2>
                        <div className="flex gap-2">
                            <Link href="/admin?period=7d">
                                <Button
                                    variant={period === '7d' ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    7j
                                </Button>
                            </Link>
                            <Link href="/admin?period=30d">
                                <Button
                                    variant={period === '30d' ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    30j
                                </Button>
                            </Link>
                            <Link href="/admin?period=all">
                                <Button
                                    variant={period === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    Tout
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <UserGrowthChart data={analyticsData} />
                </div>

                {/* Pie Chart - Takes 1 column */}
                <div>
                    <PieChartCard
                        title="Distribution"
                        data={userDistribution}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/users" className="block">
                    <div className="p-6 border border-slate-200 rounded-2xl hover:shadow-md transition-all bg-white group">
                        <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                            Utilisateurs
                        </h3>
                        <p className="text-sm text-slate-500">
                            Gérer les rôles et comptes
                        </p>
                    </div>
                </Link>

                <Link href="/admin/moderation" className="block">
                    <div className="p-6 border border-slate-200 rounded-2xl hover:shadow-md transition-all bg-white group">
                        <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                            <Activity className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                            Modération
                        </h3>
                        <p className="text-sm text-slate-500">
                            Gérer les signalements
                        </p>
                    </div>
                </Link>

                <Link href="/admin/courses" className="block">
                    <div className="p-6 border border-slate-200 rounded-2xl hover:shadow-md transition-all bg-white group">
                        <div className="h-12 w-12 rounded-lg bg-cyan-50 flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                            <DollarSign className="h-6 w-6 text-cyan-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                            Cours
                        </h3>
                        <p className="text-sm text-slate-500">
                            Gérer les formations
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
