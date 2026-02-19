import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye } from 'lucide-react'
import { CurriculumBuilder } from '@/components/admin/curriculum-builder'
import { PublishButton } from '@/components/admin/publish-button'

interface BuilderPageProps {
    params: Promise<{
        courseId: string
    }>
}

export default async function CourseBuilderPage({ params }: BuilderPageProps) {
    const { courseId } = await params
    const supabase = await createClient()

    // 1. Get Course
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

    if (!course) {
        return <div>Formation introuvable</div>
    }

    // 2. Get Modules
    const { data: modules } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

    // 3. Get Lessons
    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

    // 4. Assemble Interface
    const modulesWithLessons = (modules || []).map((module: any) => ({
        ...module,
        lessons: (lessons || []).filter((lesson: any) => lesson.module_id === module.id)
    }))

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-4">
                    <Link href="/creator/courses">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <div className="flex flex-col gap-y-1">
                        <h1 className="text-2xl font-bold">
                            Plan de cours : {course.title}
                        </h1>
                        <Link href={`/creator/courses`} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <span className={course.is_published ? "text-green-600" : "text-yellow-600"}>
                                {course.is_published ? 'Publié' : 'Brouillon'}
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="flex gap-x-2">
                    <PublishButton courseId={course.id} isPublished={course.is_published} />
                    <Link href={`/courses/${course.slug}`} target="_blank">
                        <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir en direct
                        </Button>
                    </Link>
                </div>
            </div>

            <CurriculumBuilder
                courseId={course.id}
                initialModules={modulesWithLessons}
                basePath="/creator"
            />
        </div>
    )
}
