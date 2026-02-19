import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-9 w-80 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Search and Filters Skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <Skeleton className="h-3 w-24" />
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <Skeleton className="h-3 w-16" />
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <Skeleton className="h-3 w-12" />
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <Skeleton className="h-3 w-20" />
                                </th>
                                <th className="px-6 py-3 text-right">
                                    <Skeleton className="h-3 w-16 ml-auto" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
                            {[...Array(10)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-40" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-24" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-8 w-8 rounded ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Info Skeleton */}
            <Skeleton className="h-4 w-32" />
        </div>
    )
}
