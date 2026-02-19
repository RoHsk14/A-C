'use client'

import { useState } from 'react'
import { CoursePlayer } from '@/components/course-player'
import { useRouter } from 'next/navigation'

interface Lesson {
    id: string
    title: string
    description: string | null
    video_url: string | null
    content: string | null
    order_index: number
    duration_seconds: number | null
    is_preview: boolean
    isCompleted: boolean
}

interface CoursePlayerWrapperProps {
    lessons: Lesson[]
    userId: string
}

export function CoursePlayerWrapper({ lessons, userId }: CoursePlayerWrapperProps) {
    const [currentLessonId, setCurrentLessonId] = useState(lessons[0].id)
    const [lessonsState, setLessonsState] = useState(lessons)
    const router = useRouter()

    const handleMarkComplete = async (lessonId: string) => {
        try {
            const response = await fetch('/api/lessons/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lessonId }),
            })

            if (response.ok) {
                // Mettre à jour l'état local
                setLessonsState((prev) =>
                    prev.map((lesson) =>
                        lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
                    )
                )
                router.refresh()
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error)
        }
    }

    return (
        <CoursePlayer
            lessons={lessonsState}
            currentLessonId={currentLessonId}
            onLessonChange={setCurrentLessonId}
            onMarkComplete={handleMarkComplete}
        />
    )
}
