'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, BookOpen, User, Hash, Menu, Settings, LogOut, ShieldCheck, LayoutDashboard, Users, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationBadge } from '@/components/notification-badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
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
    spaces: Space[]
}

interface NavigationProps {
    communities?: Community[]
    spaces?: Space[] // Deprecated but kept for now if needed (though we will switch to communities)
    userRole: string | undefined | null
    customLogo?: string | null
    customTitle?: string
    className?: string
}

const mainLinks = [
    { href: '/dashboard', label: 'Flux', icon: Home },
    // { href: '/community', label: 'Communauté', icon: Users },
    { href: '/creator/communities', label: 'Communautés', icon: Users },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Moi', icon: User },
]


import { SidebarContent } from '@/components/sidebar-content'

export function Navigation({ communities = [], userRole, customLogo, customTitle, className }: NavigationProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Desktop Sidebar - Premium Design */}
            <aside className={cn("hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 transition-all duration-300", className)}>
                <SidebarContent
                    communities={communities}
                    userRole={userRole}
                    customLogo={customLogo}
                    customTitle={customTitle}
                />
            </aside>

            {/* Mobile Bottom Navigation - Native App Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pb-safe z-50 h-16 md:hidden">
                <div className="flex justify-around items-center h-full">
                    {mainLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                                    isActive
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
                                )}
                            >
                                <div className="relative">
                                    <Icon className={cn("h-6 w-6 transition-transform", isActive ? "scale-110" : "")} />
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                                    )}
                                </div>
                                <span className="text-[10px] mt-1 font-medium">{link.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* View Switcher Floating Button (Admin Only) */}
            {(userRole === 'admin' || userRole === 'creator') && (
                <div className="fixed bottom-20 right-4 z-50 lg:bottom-8 lg:right-8">
                    {pathname.startsWith('/admin') ? (
                        <Link href="/dashboard">
                            <Button className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
                                <User className="mr-2 h-4 w-4" />
                                Vue Membre
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/admin">
                            <Button className="rounded-full shadow-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800" size="sm">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Vue {userRole === 'admin' ? 'Admin' : 'Créateur'}
                            </Button>
                        </Link>
                    )}
                </div>
            )}

            <style jsx global>{`
                @media (max-width: 1024px) {
                    body {
                        padding-bottom: 4rem; /* h-16 */
                    }
                }
            `}</style>
        </>
    )
}
