import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, BookOpen, DollarSign, TrendingUp, PlusCircle } from 'lucide-react'

async function getCreatorStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { totalUsers: 0, totalCourses: 0, activeEnrollments: 0, totalRevenue: 0, recentEnrollments: [] }

    // 1. COURSES
    const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('instructor_id', user.id)

    // 2. ENROLLMENTS (Active & Revenue)
    const { data: activeEnrollmentsData } = await supabase
        .from('enrollments')
        .select(`
            id,
            course:courses!inner(price_xof, instructor_id)
        `)
        .eq('status', 'active')
        .eq('course.instructor_id', user.id)

    const totalRevenue = activeEnrollmentsData?.reduce((acc, curr: any) => {
        return acc + (curr.course?.price_xof || 0)
    }, 0) || 0

    // 3. RECENT ENROLLMENTS
    const { data: recentEnrollments } = await supabase
        .from('enrollments')
        .select(`
            id,
            status,
            enrolled_at,
            user:profiles(name, email),
            course:courses!inner(title, price_xof, instructor_id)
        `)
        .eq('course.instructor_id', user.id)
        .order('enrolled_at', { ascending: false })
        .limit(10)

    // 4. USERS (My Students)
    const { data: myEnrollments } = await supabase
        .from('enrollments')
        .select('user_id, course:courses!inner(instructor_id)')
        .eq('course.instructor_id', user.id)

    const uniqueUsers = new Set(myEnrollments?.map((e: any) => e.user_id)).size
    const totalUsers = uniqueUsers

    return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        activeEnrollments: activeEnrollmentsData?.length || 0,
        totalRevenue,
        recentEnrollments: recentEnrollments || [],
    }
}

export default async function CreatorPage() {
    const stats = await getCreatorStats()

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Tableau de bord Créateur
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Vue d'ensemble de vos formations et étudiants
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mes Étudiants
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Étudiants uniques
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mes Formations
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">
                            Cours créés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inscriptions Actives
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                            Sur vos cours
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Revenus (Estimés)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalRevenue.toLocaleString('fr-FR')} XOF
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Générés par vos cours
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions Rapides</CardTitle>
                    <CardDescription>
                        Gérez vos contenus
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button asChild className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none shadow-md">
                        <Link href="/creator/courses/create">
                            <PlusCircle className="h-6 w-6" />
                            <span className="font-semibold">Nouveau Cours</span>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <Link href="/creator/courses">
                            <BookOpen className="h-6 w-6 text-zinc-500" />
                            <span>Gérer mes Cours</span>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <Link href="/creator/communities">
                            <Users className="h-6 w-6 text-zinc-500" />
                            <span>Communautés</span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Recent Enrollments */}
            <Card>
                <CardHeader>
                    <CardTitle>Inscriptions Récentes</CardTitle>
                    <CardDescription>
                        Les dernières inscriptions à vos cours
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentEnrollments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Aucune inscription pour le moment
                            </p>
                        ) : (
                            stats.recentEnrollments.map((enrollment: any) => (
                                <div
                                    key={enrollment.id}
                                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            {enrollment.user?.name || 'Utilisateur inconnu'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {enrollment.course?.title || 'Cours inconnu'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            {enrollment.course?.price_xof?.toLocaleString('fr-FR')} XOF
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
