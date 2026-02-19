import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Check, Lock, Play, MessageCircle, HelpCircle, FileText, Download } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VideoPlayer } from '@/components/video-player'
import { OnboardingModal } from '@/components/onboarding-modal'
import { CompleteCourseButton } from '@/components/complete-course-button'
import { JoinCourseButton } from '@/components/join-course-button'

interface Lesson {
    id: string
    title: string
    description: string | null
    content: string | null
    video_url: string | null
    order_index: number
    is_preview: boolean
    duration_seconds: number | null
}

interface Course {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail_url: string | null
    price_xof: number
    price_usd: number
    instructor: {
        name: string
    }
}

async function getCourseData(slug: string) {
    const supabase = await createClient()

    // Récupérer le cours
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
      id,
      title,
      slug,
      description,
      thumbnail_url,
      price_xof,
      price_usd,
      instructor:profiles!courses_instructor_id_fkey(name)
    `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (courseError || !course) {
        return null
    }

    // Récupérer les leçons
    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true })

    // Vérifier si l'utilisateur est inscrit + Onboarding + Espace
    const { data: { user } } = await supabase.auth.getUser()
    let isEnrolled = false
    let hasCompletedOnboarding = false
    let courseSpace = null

    if (user) {
        // 1. Check direct enrollment
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', course.id)
            .eq('user_id', user.id)
            .single()

        isEnrolled = !!enrollment

        // 2. Check Community Membership (Implicit Access for All Linked Courses)
        // If linked to a community AND user is member of that community -> Access Granted
        if (!isEnrolled) {
            const { data: courseCommunity } = await supabase
                .from('courses')
                .select('community_id')
                .eq('id', course.id)
                .single()

            if (courseCommunity?.community_id) {
                const { data: member } = await supabase
                    .from('community_members')
                    .select('id')
                    .eq('community_id', courseCommunity.community_id)
                    .eq('user_id', user.id)
                    .single()

                if (member) {
                    isEnrolled = true
                }
            }
        }

        // 3. Instructor Access
        // If user is the instructor -> Access Granted
        // (Note: we need to fetch instructor_id first since we only selected 'instructor:profiles(name)' above)
        // Ideally we should have selected instructor_id in the first query.
        // Let's optimize by adding instructor_id to the initial query or fetching it here if needed.
        // Actually, let's fix the initial query to include instructor_id.
        // For now, let's just do a quick check since valid instructor access is important.
        const { data: courseOwner } = await supabase
            .from('courses')
            .select('instructor_id')
            .eq('id', course.id)
            .single()

        if (courseOwner && courseOwner.instructor_id === user.id) {
            isEnrolled = true
        }

        // Onboarding Check
        const { data: status } = await supabase
            .from('onboarding_status')
            .select('completed')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .single()

        hasCompletedOnboarding = !!status?.completed

        // Space Fetch
        const { data: space } = await supabase
            .from('spaces')
            .select('slug, name, welcome_message, accent_color')
            .eq('course_id', course.id)
            .single()

        courseSpace = space
    }

    // Récupérer les ressources du cours
    const { data: resources } = await supabase
        .from('course_resources')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })

    return {
        course: course as unknown as Course,
        lessons: (lessons || []) as Lesson[],
        resources: (resources || []) as any[],
        isEnrolled,
        hasCompletedOnboarding,
        courseSpace,
        user,
    }
}

// ... (interfaces)

export default async function CoursePage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ lesson?: string, view?: string }>
}) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams
    const slug = resolvedParams.slug
    const view = resolvedSearchParams.view || 'lesson'

    const data = await getCourseData(slug)

    if (!data) {
        notFound()
    }

    const { course, lessons, resources, isEnrolled, hasCompletedOnboarding, courseSpace, user } = data

    // Si pas connecté, rediriger vers login
    if (!user) {
        redirect(`/login?redirect=/courses/${slug}`)
    }

    // Leçon actuelle
    const currentLessonIndex = resolvedSearchParams.lesson
        ? parseInt(resolvedSearchParams.lesson)
        : 0
    const currentLesson = lessons[currentLessonIndex] || lessons[0]

    // Handle empty course (no lessons)
    if (!currentLesson && view !== 'resources') {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Cours en préparation</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">Ce cours n'a pas encore de leçons publiées.</p>
                    <Button asChild variant="outline">
                        <Link href="/courses">Retour aux cours</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    // Vérifier si l'utilisateur peut accéder
    const canAccessLesson = isEnrolled || currentLesson?.is_preview

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="flex h-screen flex-col md:flex-row">
                {/* Sidebar des leçons (Hidden on mobile if viewing resources? No, keep it) */}
                <aside className="w-full md:w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto flex-shrink-0 hidden md:block">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <Link
                            href="/dashboard"
                            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-3 block"
                        >
                            ← Retour au flux
                        </Link>
                        <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-2">
                            {course.title}
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="p-4 space-y-2">
                        {lessons.map((lesson, index) => {
                            const isActive = index === currentLessonIndex && view === 'lesson'
                            const isLocked = !isEnrolled && !lesson.is_preview

                            return (
                                <Link
                                    key={lesson.id}
                                    href={`/courses/${slug}?lesson=${index}&view=lesson`}
                                    className={`block p-3 rounded-lg transition-all ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800'
                                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${isActive
                                                ? 'bg-indigo-600 text-white'
                                                : isLocked
                                                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                }`}
                                        >
                                            {isLocked ? <Lock className="w-3 h-3" /> : isActive ? <Play className="w-3 h-3" /> : <span className="font-mono">{index + 1}</span>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-medium text-sm leading-tight ${isActive ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {lesson.title}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Top Tabs */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex gap-4">
                        <Link
                            href={`/courses/${slug}?lesson=${currentLessonIndex}&view=lesson`}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'lesson' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
                        >
                            <Play className="w-4 h-4" />
                            Leçon
                        </Link>
                        <Link
                            href={`/courses/${slug}?lesson=${currentLessonIndex}&view=resources`}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'resources' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Ressources
                            {resources.length > 0 && <span className="ml-1 text-xs bg-zinc-200 dark:bg-zinc-700 px-1.5 rounded-full">{resources.length}</span>}
                        </Link>
                    </div>

                    {view === 'resources' ? (
                        <div className="max-w-4xl mx-auto p-6 md:p-10">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Ressources du cours</h1>

                            {resources.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FileText className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <p className="text-zinc-500">Aucune ressource disponible pour ce cours.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {resources.map((resource) => (
                                        <Card key={resource.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 flex items-start gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{resource.title}</h3>
                                                    {resource.description && <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{resource.description}</p>}
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                                                        <span>{resource.file_type?.toUpperCase() || 'FICHIER'}</span>
                                                        <span>•</span>
                                                        <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true, locale: fr })}</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={resource.file_url} download target="_blank" rel="noopener noreferrer">
                                                        <Download className="w-4 h-4 text-zinc-500" />
                                                    </a>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // VUE LEÇON
                        <>
                            {/* Onboarding Modal */}
                            {isEnrolled && !hasCompletedOnboarding && (
                                <OnboardingModal
                                    courseId={course.id}
                                    courseTitle={course.title}
                                    welcomeMessage={courseSpace?.welcome_message}
                                    accentColor={courseSpace?.accent_color}
                                />
                            )}

                            {!canAccessLesson ? (
                                // Banner "Débloquer le cours"
                                <div className="h-full flex items-center justify-center p-8">
                                    <Card className="max-w-md w-full border-zinc-200 dark:border-zinc-800 shadow-xl">
                                        <CardContent className="p-8 text-center">
                                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                                                Débloquez ce cours
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                                Accédez à toutes les leçons et ressources de ce cours pour devenir un expert.
                                            </p>
                                            <JoinCourseButton
                                                courseId={course.id}
                                                courseSlug={slug}
                                                price={course.price_xof}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                // Contenu de la leçon
                                <div className="max-w-4xl mx-auto p-6 md:p-10">
                                    {/* Mode Cinéma - Video Player */}
                                    <div className="mb-10">
                                        <VideoPlayer
                                            videoId={currentLesson.video_url}
                                            title={currentLesson.title}
                                        />
                                    </div>

                                    {/* Titre de la leçon + Actions */}
                                    <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                                {currentLesson.title}
                                            </h1>
                                            {courseSpace && (
                                                <Button asChild variant="outline" className="shrink-0 gap-2">
                                                    <Link href={`/dashboard?space=${courseSpace.slug}`}>
                                                        <MessageCircle className="w-4 h-4" />
                                                        Poser une question
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        {currentLesson.description && (
                                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {currentLesson.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Contenu Markdown */}
                                    {currentLesson.content && (
                                        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 mb-10">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: currentLesson.content.replace(/\n/g, '<br />'),
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    <div className="flex justify-between items-center py-6 border-t border-zinc-200 dark:border-zinc-800">
                                        <div>
                                            {currentLessonIndex > 0 ? (
                                                <Button variant="outline" asChild className="gap-2">
                                                    <Link href={`/courses/${slug}?lesson=${currentLessonIndex - 1}&view=lesson`}>
                                                        ← Leçon précédente
                                                    </Link>
                                                </Button>
                                            ) : null}
                                        </div>

                                        <div>
                                            {currentLessonIndex < lessons.length - 1 ? (
                                                <Button asChild className="gap-2">
                                                    <Link href={`/courses/${slug}?lesson=${currentLessonIndex + 1}&view=lesson`}>
                                                        Leçon suivante →
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <CompleteCourseButton
                                                    courseId={course.id}
                                                    courseSlug={slug}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
