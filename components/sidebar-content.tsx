
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useParams } from 'next/navigation'
import { Home, BookOpen, User, Hash, LayoutDashboard, Users, Bell, Settings, LogOut, ArrowLeft, Grid, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationBadge } from '@/components/notification-badge'
import { signOut } from '@/app/auth/actions'

interface Space {
    id: string
    slug: string
    name: string
    is_private: boolean
}

interface Community {
    id: string
    name: string
    slug: string
    logo_url?: string | null
    spaces: Space[]
}

interface SidebarContentProps {
    communities?: Community[]
    userRole: string | undefined | null
    customLogo?: string | null
    customTitle?: string
    className?: string
}

const mainLinks = [
    { href: '/dashboard', label: 'Flux', icon: Home },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/courses', label: 'Formations', icon: BookOpen },
    { href: '/profile', label: 'Profil', icon: User },
]


export function SidebarContent({ communities = [], userRole, customLogo, customTitle, className }: SidebarContentProps) {
    const pathname = usePathname()
    const params = useParams()
    const communitySlug = params?.slug as string
    const searchParams = useSearchParams()
    const currentSpace = searchParams.get('space')

    const activeCommunity = communities.find(c => c.slug === communitySlug)

    return (
        <div className={cn("flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-950 h-full", className)}>
            {/* Header / Logo */}
            <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-zinc-100 dark:border-zinc-900">
                {activeCommunity ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {activeCommunity.logo_url ? (
                                <img src={activeCommunity.logo_url} alt={activeCommunity.name} className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-xs">{activeCommunity.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {activeCommunity.name}
                            </span>
                        </div>
                        <Link href="/communities" className="text-zinc-400 hover:text-indigo-600 transition-colors" title="Changer de communauté">
                            <Grid className="h-5 w-5" />
                        </Link>
                    </div>
                ) : customLogo ? (
                    <Link href="#" className="flex items-center gap-3">
                        <img src={customLogo} alt={customTitle || 'Logo'} className="h-8 w-auto object-contain" />
                        {customTitle && (
                            <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                                {customTitle}
                            </span>
                        )}
                    </Link>
                ) : (
                    <Link href="/communities" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                            <span className="text-white font-bold text-sm">AC</span>
                        </div>
                        <span className="font-semibold text-xl text-zinc-900 dark:text-zinc-100">AfroCircle</span>
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                {/* Main Links (Global) - Only show if NO active community OR keep them? 
                    User says: "La Sidebar gauche doit alors filtrer et afficher uniquement les spaces..."
                    Usually dashboard/notifications/profile are global.
                    Let's keep them but maybe adapt 'Flux' to 'Flux Communauté' if active?
                */}
                <div>
                    <p className="px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    <div className="space-y-1">
                        {mainLinks.map((link) => {
                            const Icon = link.icon
                            // If in community, maybe redirect Dashboard to Community Feed?
                            // For now keep standard links.
                            const isActive = pathname === link.href && !currentSpace

                            // If we are in a community, main links might need to point to /c/[slug]/...
                            // But for now let's keep global structure unless user requested full isolation.

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                            isActive
                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300'
                                        )}
                                    />
                                    {link.label}
                                    {link.label === 'Notifications' && <NotificationBadge />}
                                </Link>
                            )
                        })}

                        {/* Admin/Creator Section (Keep visible) */}
                        {(userRole === 'admin' || userRole === 'creator') && (
                            <div className="mt-8">
                                <p className="px-2 text-xs font-semibold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider mb-2">
                                    {userRole === 'admin' ? 'Administration' : 'Espace Créateur'}
                                </p>
                                {/* ... keep links ... */}
                                <div className="space-y-1">
                                    <Link
                                        href={userRole === 'admin' ? '/admin' : '/creator'}
                                        className={cn(
                                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                                            (userRole === 'admin' && pathname === '/admin') || (userRole !== 'admin' && pathname === '/creator')
                                                ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 shadow-sm'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-700 dark:hover:text-amber-500'
                                        )}
                                    >
                                        <LayoutDashboard className="mr-3 h-5 w-5" />
                                        Vue d'ensemble
                                    </Link>
                                    <Link
                                        href="/creator/courses"
                                        className={cn(
                                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                                            pathname.startsWith('/creator/courses')
                                                ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 shadow-sm'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-700 dark:hover:text-amber-500'
                                        )}
                                    >
                                        <BookOpen className="mr-3 h-5 w-5" />
                                        Gestion Cours
                                    </Link>

                                    <Link
                                        href="/creator/communities"
                                        className={cn(
                                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                                            pathname.startsWith('/creator/communities')
                                                ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 shadow-sm'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-700 dark:hover:text-amber-500'
                                        )}
                                    >
                                        <Users className="mr-3 h-5 w-5" />
                                        Communautés
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Communities & Spaces */}
                {activeCommunity ? (
                    /* SHOW ONLY ACTIVE COMMUNITY SPACES */
                    <div key={activeCommunity.id}>
                        {/* Community Specific Links */}
                        <div className="space-y-1 mb-6">
                            <Link
                                href={`/courses?communityId=${activeCommunity.id}`}
                                className={cn(
                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                                    pathname === '/courses' && searchParams.get('communityId') === activeCommunity.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                                )}
                            >
                                <BookOpen className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-500" />
                                Formations
                            </Link>
                        </div>

                        <div className="flex items-center px-2 mb-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                Espaces
                            </span>
                        </div>

                        <div className="space-y-1">
                            {activeCommunity.spaces && activeCommunity.spaces.map((space) => {
                                const isActive = currentSpace === space.slug
                                return (
                                    <Link
                                        key={space.id}
                                        href={`/c/${activeCommunity.slug}/s/${space.slug}`}
                                        className={cn(
                                            'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ml-2',
                                            isActive
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                                        )}
                                    >
                                        <Hash
                                            className={cn(
                                                'mr-2 h-4 w-4 flex-shrink-0 transition-colors',
                                                isActive
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-zinc-400 group-hover:text-zinc-500'
                                            )}
                                        />
                                        <span className="truncate">{space.name}</span>
                                        {space.is_private && (
                                            <span className="ml-auto text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                                                Privé
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    /* SHOW ALL COMMUNITIES (Fallback / Global View) */
                    communities.map((community) => (
                        <div key={community.id}>
                            <div className="flex items-center px-2 mb-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors">
                                <Link href={`/c/${community.slug}`} className="flex items-center w-full py-1">
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex-1">
                                        {community.name}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 space-y-1">
                <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                    <Settings className="mr-3 h-5 w-5 text-zinc-400" />
                    Paramètres
                </button>

                <form action={signOut}>
                    <button type="submit" className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors">
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                    </button>
                </form>
            </div>
        </div>
    )
}
