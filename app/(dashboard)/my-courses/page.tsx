import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, BookOpen, Clock, Calendar } from 'lucide-react'

async function getMyCourses() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Fetch active enrollments with course details
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            id,
            enrolled_at,
            course:courses (
                id,
                title,
                slug,
                description,
                thumbnail_url,
                instructor_id
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false })

    return enrollments || []
}

export default async function MyCoursesPage() {
    const enrollments = await getMyCourses()

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Mes Formations
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Retrouvez toutes les formations auxquelles vous êtes inscrit.
                    </p>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        Aucune formation en cours
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
                        Vous n'êtes inscrit à aucune formation pour le moment. Découvrez notre catalogue pour commencer à apprendre.
                    </p>
                    <Link href="/courses">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8">
                            Explorer le catalogue
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment: any) => (
                        <Card key={enrollment.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800">
                            <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                {enrollment.course.thumbnail_url ? (
                                    <img
                                        src={enrollment.course.thumbnail_url}
                                        alt={enrollment.course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>

                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">
                                        En cours
                                    </Badge>
                                    <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                                <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {enrollment.course.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pb-3">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                                    {enrollment.course.description || "Aucune description disponible pour ce cours."}
                                </p>

                                {/* Progress Bar Placeholder - To be connected with real data later */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="text-zinc-600 dark:text-zinc-400">Progression</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">0%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 w-0 rounded-full" />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-3">
                                <Link href={`/courses/${enrollment.course.slug || enrollment.course.id}`} className="w-full">
                                    <Button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-zinc-200 transition-colors group-hover:bg-indigo-600 dark:group-hover:bg-white">
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Continuer
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
