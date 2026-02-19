import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PlusCircle, Pencil, Layout, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function AdminCoursesPage() {
    const supabase = await createClient()

    // Check role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    // Fetch courses
    let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

    if (!isAdmin) {
        query = query.eq('instructor_id', user.id)
    }

    const { data: courses } = await query

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Mes Formations
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Gérez vos cours, modules et contenus
                    </p>
                </div>
                <Link href="/creator/courses/create">
                    <Button variant="brand">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Cours
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courses || []).length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                        <BookOpen className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Aucune formation
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
                            Commencez par créer votre première formation
                        </p>
                        <Link href="/creator/courses/create">
                            <Button variant="outline">
                                Créer une formation
                            </Button>
                        </Link>
                    </div>
                ) : (
                    courses!.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-zinc-100 dark:bg-zinc-800 relative">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-400">
                                        <Layout className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.is_published
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {course.is_published ? 'Publié' : 'Brouillon'}
                                    </span>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {course.price_xof > 0
                                        ? `${course.price_xof.toLocaleString('fr-FR')} FCFA`
                                        : 'Gratuit'}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Link href={`/creator/courses/${course.id}/builder`} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            <Layout className="mr-2 h-4 w-4" />
                                            Builder
                                        </Button>
                                    </Link>
                                    <Link href={`/creator/courses/${course.id}/edit`} className="w-full">
                                        <Button variant="ghost" className="w-full">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Éditer
                                        </Button>
                                    </Link>
                                </div>
                                <div className="mt-4 text-xs text-zinc-400 text-center">
                                    Créé le {format(new Date(course.created_at), 'd MMMM yyyy', { locale: fr })}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
