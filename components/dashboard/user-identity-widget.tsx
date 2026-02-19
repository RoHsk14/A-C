
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function UserIdentityWidget() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 mb-6 overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-800 shadow-sm">
                            <AvatarImage src={profile.avatar_url || user.user_metadata?.avatar_url} />
                            <AvatarFallback>{profile.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {profile.name || user.email}
                        </p>
                        <p className="text-xs text-zinc-500 truncate capitalize">
                            {profile.role || 'Membre'}
                        </p>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" title="Se déconnecter">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href="/profile" className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                        <User className="w-3 h-3" />
                        Profil
                    </Link>
                    <Link href="/settings" className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                        <Settings className="w-3 h-3" />
                        Paramètres
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
