
import { SmartRightSidebar } from '@/components/dashboard/smart-right-sidebar'
import { UserIdentityWidget } from '@/components/dashboard/user-identity-widget'

export default function CommunityPage() {
    return (
        <div className="md:hidden pb-20"> {/* Only visible on mobile/tablet where sidebar is hidden */}
            <div className="px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Communauté</h1>
                <SmartRightSidebar
                    userIdentity={<UserIdentityWidget />}
                    className="block w-full h-auto border-none shadow-none static p-0 bg-transparent dark:bg-transparent"
                />
            </div>
        </div>
    )
}
