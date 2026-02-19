import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

interface Course {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail_url: string | null
    price_xof: number
    price_usd: number
    instructor: {
        name: string
    }
    hasAccess?: boolean
}

async function getCourses(communityId?: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let query = supabase
        .from('courses')
        .select(`
      id,
      slug,
      title,
      description,
      thumbnail_url,
      price_xof,
      price_usd,
      instructor:profiles(name)
    `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    if (communityId) {
        query = query.eq('community_id', communityId)
    }

    const { data: courses, error } = await query

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    // Vérifier les accès de l'utilisateur
    if (user) {
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', user.id)
            .eq('status', 'active')

        const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) || [])

        return (courses as unknown as Course[]).map((course) => ({
            ...course,
            hasAccess: enrolledCourseIds.has(course.id),
        }))
    }

    return courses as unknown as Course[]
}

function CourseSkeleton() {
    return (
        <Card>
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}

function CoursesGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <CourseSkeleton key={i} />
            ))}
        </div>
    )
}

async function CoursesContent({ communityId }: { communityId?: string }) {
    const courses = await getCourses(communityId)

    if (courses.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                        {communityId
                            ? "Aucune formation disponible dans cette communauté pour le moment."
                            : "Aucune formation disponible pour le moment."}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                        {course.thumbnail_url ? (
                            <Image
                                src={course.thumbnail_url}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-indigo-50">
                                <span className="text-4xl text-indigo-200">📚</span>
                            </div>
                        )}

                        {/* Badge Accès */}
                        {course.hasAccess && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Accès
                            </div>
                        )}
                    </div>

                    <CardHeader>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            par {course.instructor.name}
                        </p>
                    </CardHeader>

                    <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {course.description || 'Aucune description disponible.'}
                        </p>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-indigo-600">
                                {course.price_xof.toLocaleString('fr-FR')} XOF
                            </p>
                            <p className="text-xs text-muted-foreground">
                                ~${(course.price_usd / 100).toFixed(2)}
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={`/courses/${course.slug}`}>
                                {course.hasAccess ? 'Continuer' : 'Voir le cours'}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{ communityId?: string }>
}) {
    const { communityId } = await searchParams

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mes Formations</h1>
                <p className="text-muted-foreground mt-1">
                    Découvrez nos formations et développez vos compétences
                </p>
            </div>

            {/* Courses Grid */}
            <Suspense fallback={<CoursesGrid />}>
                <CoursesContent communityId={communityId} />
            </Suspense>
        </div>
    )
}
