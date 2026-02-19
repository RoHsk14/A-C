import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Flag, Settings, BookOpen, Search, Bell, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check admin role and get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/access-denied')
    }

    const menuLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Utilisateurs', icon: Users },
        { href: '/admin/courses', label: 'Cours', icon: BookOpen },
        { href: '/admin/communities', label: 'Communautés', icon: Globe },
    ]

    const otherLinks = [
        { href: '/admin/moderation', label: 'Modération', icon: Flag },
        { href: '/admin/logs', label: 'Logs', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50">
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AC</span>
                            </div>
                            <span className="font-semibold text-slate-900">AfroCircle</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-8">
                        {/* MENU Section */}
                        <div>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Menu
                            </p>
                            <div className="space-y-1">
                                {menuLinks.map((link) => {
                                    const Icon = link.icon
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                                                'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                            )}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span className="font-medium text-sm">{link.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* OTHERS Section */}
                        <div>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Others
                            </p>
                            <div className="space-y-1">
                                {otherLinks.map((link) => {
                                    const Icon = link.icon
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                                                'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                            )}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span className="font-medium text-sm">{link.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </nav>

                    {/* Back to Dashboard */}
                    <div className="p-4 border-t border-slate-100">
                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full justify-center text-sm">
                                Retour au Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="pl-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="h-full px-8 flex items-center justify-between">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="Rechercher..."
                                    className="pl-10 bg-slate-50 border-slate-200 rounded-lg h-10 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Right Side - Notifications & Profile */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5 text-slate-600" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            </Button>

                            {/* User Profile */}
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">
                                        {profile?.name?.[0]?.toUpperCase() || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-slate-900">
                                        {profile?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-slate-500">Administrateur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
