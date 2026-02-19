import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { redirect } from 'next/navigation'
import { getCachedCommunities, getCachedUserProfile } from '@/lib/cache'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Récupérer les communautés et le profil utilisateur (avec cache)
    const [communities, profile] = await Promise.all([
        getCachedCommunities(),
        getCachedUserProfile(user.id)
    ])

    const userRole = profile?.role

    return (

        <div className="min-h-screen bg-gray-50">
            <Navigation communities={communities} userRole={userRole} />
            <MobileHeader
                communities={communities}
                userRole={userRole}
                userIdentity={<UserIdentityWidget />}
            />

            {/* Main Content & Right Sidebar Container */}
            <div className="md:pl-72 flex flex-1">
                {/* Center Content */}
                <div className="flex-1 min-w-0">
                    <main className="pb-20 md:pb-8">
                        {children}
                    </main>
                </div>

                {/* Right Sidebar (Global & Persistent) */}
                <SmartRightSidebar userIdentity={<UserIdentityWidget />} />
            </div>
        </div>
    )
}

import { SmartRightSidebar } from '@/components/dashboard/smart-right-sidebar'
import { UserIdentityWidget } from '@/components/dashboard/user-identity-widget'
import { MobileHeader } from '@/components/mobile-header'
