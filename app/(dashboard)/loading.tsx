import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Skeleton */}
            <div className="hidden md:flex w-72 flex-col fixed inset-y-0 border-r border-zinc-200 bg-white p-4 space-y-4">
                <div className="h-8 w-32 bg-zinc-100 rounded animate-pulse mb-8" />
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                </div>
                <div className="mt-8 space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="md:pl-72 flex flex-col flex-1">
                <main className="flex-1 p-6 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Feed / Content Skeleton */}
                    <div className="space-y-4 max-w-2xl mx-auto w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-24 w-full rounded-md" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
