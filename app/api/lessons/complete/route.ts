import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { lessonId } = await request.json()

        if (!lessonId) {
            return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
        }

        // Vérifier que l'utilisateur a accès à cette leçon
        const { data: lesson } = await supabase
            .from('lessons')
            .select('course_id')
            .eq('id', lessonId)
            .single()

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
        }

        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', lesson.course_id)
            .eq('status', 'active')
            .maybeSingle()

        if (!enrollment) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Marquer la leçon comme terminée
        const { error } = await supabase
            .from('completed_lessons')
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
            })

        if (error) {
            console.error('Error marking lesson complete:', error)
            return NextResponse.json({ error: 'Failed to mark lesson complete' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
