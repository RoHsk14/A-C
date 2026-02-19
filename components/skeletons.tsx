import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
    return (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar skeleton */}
                    <Skeleton className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700" />
                        <Skeleton className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3 px-6">
                {/* Content skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-700" />
                </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4 px-6 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 mt-3">
                <Skeleton className="h-8 w-20 bg-zinc-200 dark:bg-zinc-700" />
                <Skeleton className="h-8 w-28 bg-zinc-200 dark:bg-zinc-700" />
            </CardFooter>
        </Card>
    )
}

export function CourseCardSkeleton() {
    return (
        <Card className="overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Thumbnail skeleton */}
            <Skeleton className="w-full h-48 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600" />

            <CardHeader>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-700" />
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700" />
                        <Skeleton className="h-6 w-32 bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 flex-1 bg-zinc-200 dark:bg-zinc-700" />
                        <Skeleton className="h-9 flex-1 bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
