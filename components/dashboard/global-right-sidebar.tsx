
import { UserIdentityWidget } from './user-identity-widget'
import { RightSidebar } from './right-sidebar'

export async function GlobalRightSidebar({
    spaceId,
    courseSlug
}: {
    spaceId?: string
    courseSlug?: string
}) {
    return (
        <aside className="w-80 hidden xl:block border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 h-screen sticky top-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            {/* 1. Always show User Identity */}
            <UserIdentityWidget />

            {/* 2. Contextual Content */}
            {courseSlug ? (
                // Course Context
                <div className="space-y-6">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Navigation Cours</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">
                            Liste des modules à venir...
                        </p>
                    </div>
                </div>
            ) : (
                // Default / Community Context
                <RightSidebar spaceId={spaceId} />
            )}
        </aside>
    )
}
