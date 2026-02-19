import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        label: string
    }
    className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
    const isPositive = trend && trend.value >= 0

    return (
        <Card className={`rounded-2xl shadow-sm border-slate-200 ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-bold text-slate-900">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1.5 mt-2">
                                {isPositive ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : ''}{trend.value}%
                                </span>
                                <span className="text-sm text-slate-500">
                                    {trend.label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
