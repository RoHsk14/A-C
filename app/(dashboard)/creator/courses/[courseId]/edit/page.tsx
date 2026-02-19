import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditCourseForm } from '@/components/admin/edit-course-form'

interface EditCoursePageProps {
    params: Promise<{
        courseId: string
    }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
    const { courseId } = await params
    const supabase = await createClient()

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

    if (!course) {
        notFound()
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Modifier la formation</h1>
                <p className="text-zinc-500">Mettez à jour les informations de base</p>
            </div>

            <EditCourseForm course={course} />
        </div>
    )
}
