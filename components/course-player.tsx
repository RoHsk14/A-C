'use client'

import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, ChevronRight, Video, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface CoursePlayerProps {
    lessons: Lesson[]
    currentLessonId: string
    onLessonChange: (lessonId: string) => void
    onMarkComplete: (lessonId: string) => void
}

export function CoursePlayer({
    lessons,
    currentLessonId,
    onLessonChange,
    onMarkComplete,
}: CoursePlayerProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const currentLesson = lessons.find((l) => l.id === currentLessonId) || lessons[0]

    const handleMarkComplete = async () => {
        if (!currentLesson.isCompleted) {
            await onMarkComplete(currentLesson.id)
        }
    }

    // Extraction Logic
    const getVideoComponent = (urlOrId: string | null) => {
        if (!urlOrId) {
            return (
                <Card className="aspect-video flex items-center justify-center bg-gray-50 mb-6 border-zinc-200">
                    <CardContent className="text-center">
                        <Video className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-muted-foreground">Aucune vidéo disponible</p>
                    </CardContent>
                </Card>
            )
        }

        const cleanId = urlOrId.trim()
        const lowerId = cleanId.toLowerCase()

        // 1. YouTube Detection
        // ID standard is 11 chars. URL contains youtube or youtu.be
        const isYoutube = cleanId.length === 11 || lowerId.includes('youtube') || lowerId.includes('youtu.be')

        if (isYoutube) {
            let youtubeId = cleanId
            try {
                if (lowerId.includes('v=')) {
                    youtubeId = cleanId.split('v=')[1].split('&')[0]
                } else if (lowerId.includes('youtu.be/')) {
                    youtubeId = cleanId.split('youtu.be/')[1].split('?')[0]
                }
            } catch (e) {
                console.error("Error extracting youtube ID", e)
            }

            return (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative shadow-lg">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={currentLesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            )
        }

        // 2. Mux & HTML5 Detection
        let muxPlaybackId = cleanId
        const isUrl = cleanId.startsWith('http')

        if (isUrl) {
            if (cleanId.includes('stream.mux.com')) {
                const match = cleanId.match(/\/([^/]+)\.m3u8/)
                muxPlaybackId = match ? match[1] : cleanId
            } else if (cleanId.match(/\.(mp4|mov|webm)$/i)) {
                // 3. Direct File (HTML5 Video)
                return (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative shadow-lg">
                        <video
                            className="w-full h-full"
                            controls
                            playsInline
                            preload="metadata"
                            src={cleanId}
                        >
                            Votre navigateur ne supporte pas la lecture de cette vidéo.
                        </video>
                    </div>
                )
            } else {
                // Unknown URL format (not Mux, not Youtube)
                return (
                    <Card className="aspect-video flex items-center justify-center bg-gray-50 mb-6">
                        <CardContent>
                            <p className="text-muted-foreground">Format vidéo non reconnu (URL inconnue)</p>
                        </CardContent>
                    </Card>
                )
            }
        }

        // Render Mux
        return (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
                <MuxPlayer
                    playbackId={muxPlaybackId}
                    metadata={{
                        video_title: currentLesson.title,
                    }}
                    streamType="on-demand"
                    className="w-full h-full"
                    primaryColor="#FFFFFF"
                    secondaryColor="#000000"
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Sidebar - Lessons List */}
            <aside
                className={cn(
                    'md:w-80 bg-white border-r border-gray-200 overflow-y-auto shrink-0',
                    sidebarOpen ? 'block' : 'hidden md:block'
                )}
            >
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="font-semibold text-lg">Contenu du cours</h2>
                    <p className="text-sm text-muted-foreground">
                        {lessons.filter((l) => l.isCompleted).length} / {lessons.length} terminées
                    </p>
                </div>

                <div className="divide-y divide-gray-100">
                    {lessons.map((lesson, index) => (
                        <button
                            key={lesson.id}
                            onClick={() => onLessonChange(lesson.id)}
                            className={cn(
                                'w-full text-left p-4 hover:bg-gray-50 transition-colors',
                                currentLesson.id === lesson.id && 'bg-indigo-50 border-l-4 border-indigo-600'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Status Icon */}
                                {lesson.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                                )}

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                        {index + 1}. {lesson.title}
                                    </p>
                                    {lesson.duration_seconds && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {Math.floor(lesson.duration_seconds / 60)} min
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-white/50">
                <div className="max-w-5xl mx-auto p-4 md:p-8">

                    {getVideoComponent(currentLesson.video_url)}

                    {/* Lesson Info */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {currentLesson.title}
                                </h1>
                                {currentLesson.description && (
                                    <p className="text-muted-foreground">{currentLesson.description}</p>
                                )}
                            </div>

                            <Button
                                onClick={handleMarkComplete}
                                variant={currentLesson.isCompleted ? 'outline' : 'default'}
                                className={cn(
                                    "ml-4 shrink-0 transition-all",
                                    currentLesson.isCompleted ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : "bg-indigo-600 hover:bg-indigo-700"
                                )}
                            >
                                {currentLesson.isCompleted ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Terminé
                                    </>
                                ) : (
                                    'Marquer comme terminé'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Lesson Content (Markdown) */}
                    {currentLesson.content && (
                        <Card className="border-none shadow-sm bg-white ring-1 ring-black/5">
                            <CardContent className="prose prose-zinc max-w-none p-6 md:p-8">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: currentLesson.content.replace(/\n/g, '<br />'),
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
