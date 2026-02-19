import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminLoading() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-9 w-20 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart Section Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-64" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>

                {/* Chart Card Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] flex items-end justify-between gap-2 px-4">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="flex-1"
                                    style={{ height: `${Math.random() * 80 + 20}%` }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-8 mb-3" />
                            <Skeleton className="h-5 w-40 mb-1" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
