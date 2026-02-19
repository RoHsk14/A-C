'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface PieChartCardProps {
    title: string
    data: Array<{
        name: string
        value: number
        color: string
    }>
}

const COLORS = {
    blue: '#4F46E5',      // Royal Blue
    orange: '#F97316',    // Orange
    turquoise: '#06B6D4', // Turquoise
    purple: '#8B5CF6',    // Purple
    green: '#10B981',     // Green
}

export function PieChartCard({ title, data }: PieChartCardProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-semibold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                                <span className="text-sm text-slate-600">
                                    {value} ({entry.payload.value})
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
