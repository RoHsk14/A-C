'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface UserGrowthChartProps {
    data: Array<{
        date: string
        users: number
        newUsers: number
    }>
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    // Format data for display
    const formattedData = data.map(item => ({
        ...item,
        displayDate: format(new Date(item.date), 'dd MMM', { locale: fr })
    }))

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                    Croissance des Utilisateurs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#64748B"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#64748B"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            labelStyle={{ color: '#1E293B', fontWeight: 600 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="users"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
