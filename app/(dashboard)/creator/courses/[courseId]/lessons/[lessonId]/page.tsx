import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LessonEditForm } from '@/components/admin/lesson-edit-form'

interface LessonPageProps {
    params: Promise<{
        courseId: string
        lessonId: string
    }>
}

export default async function LessonPage({ params }: LessonPageProps) {
    const { courseId, lessonId } = await params
    const supabase = await createClient()

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

    if (!lesson) {
        notFound()
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-x-4 mb-8">
                <Link href={`/creator/courses/${courseId}/builder`} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au plan
                    </Button>
                </Link>
                <div className="flex flex-col gap-y-1">
                    <h1 className="text-2xl font-bold">
                        Édition du contenu
                    </h1>
                    <span className="text-sm text-zinc-500">
                        Leçon : {lesson.title}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <LessonEditForm
                        initialData={lesson}
                        courseId={courseId}
                        lessonId={lessonId}
                    />
                </div>
            </div>
        </div>
    )
}
