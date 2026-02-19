import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>

            {/* Posts Skeletons */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
