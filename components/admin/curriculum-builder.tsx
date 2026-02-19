'use client'

import { useState } from 'react'
import { createModule, createLesson, deleteModule, updateModule } from '@/app/(dashboard)/creator/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, GripVertical, Pencil, Trash2, FileVideo, Video } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Lesson {
    id: string
    title: string
    module_id: string
    order_index: number
    is_preview: boolean
}

interface Module {
    id: string
    title: string
    order_index: number
    lessons: Lesson[]
}

interface CurriculumBuilderProps {
    courseId: string
    initialModules: Module[]
    basePath?: string
}

export function CurriculumBuilder({ courseId, initialModules, basePath = '/admin' }: CurriculumBuilderProps) {
    const [modules, setModules] = useState(initialModules)
    const [isCreatingModule, setIsCreatingModule] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState('')
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
    const router = useRouter()

    const onModuleCreate = async () => {
        if (!newModuleTitle.trim()) return

        try {
            await createModule(courseId, newModuleTitle)
            setNewModuleTitle('')
            setIsCreatingModule(false)
            // Refresh auto via Server Action revalidate, but local state update is nice 
            // For now, assume revalidate refreshes page props if we are lucky, 
            // but in Client Component with Props, we usually assume hydration or router.refresh()
            // router.refresh() is called in logic usually? No, Next 15 handles it differently.
            // Let's rely on router.refresh() if needed, but server keys revalidatePath usually works.
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {modules.map((module) => (
                    <ModuleItem
                        key={module.id}
                        module={module}
                        courseId={courseId}
                        basePath={basePath}
                    />
                ))}
            </div>

            {isCreatingModule ? (
                <Card className="p-4 bg-zinc-50 border-dashed border-zinc-300">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Titre du nouveau module"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onModuleCreate()}
                            autoFocus
                        />
                        <Button onClick={onModuleCreate}>Créer</Button>
                        <Button variant="ghost" onClick={() => setIsCreatingModule(false)}>Annuler</Button>
                    </div>
                </Card>
            ) : (
                <Button
                    variant="outline"
                    className="w-full border-dashed py-8 text-zinc-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
                    onClick={() => setIsCreatingModule(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un Module
                </Button>
            )}
        </div>
    )
}

function ModuleItem({ module, courseId, basePath }: { module: Module, courseId: string, basePath: string }) {
    const [isCreatingLesson, setIsCreatingLesson] = useState(false)
    const [newLessonTitle, setNewLessonTitle] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(module.title)

    const onLessonCreate = async () => {
        if (!newLessonTitle.trim()) return
        try {
            await createLesson(module.id, newLessonTitle, courseId)
            setNewLessonTitle('')
            setIsCreatingLesson(false)
        } catch (error) {
            console.error(error)
        }
    }

    const onModuleUpdate = async () => {
        try {
            await updateModule(module.id, title, courseId)
            setIsEditing(false)
        } catch (error) {
            console.error(error)
        }
    }

    const onModuleDelete = async () => {
        if (!confirm('Voulez-vous vraiment supprimer ce module et toutes ses leçons ?')) return
        try {
            await deleteModule(module.id, courseId)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-x-2 flex-1">
                    <GripVertical className="h-5 w-5 text-zinc-400 cursor-move" />
                    {isEditing ? (
                        <div className="flex gap-2 items-center flex-1 mr-4">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Button size="sm" onClick={onModuleUpdate}>OK</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>X</Button>
                        </div>
                    ) : (
                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 pl-1">
                            {module.title}
                        </h3>
                    )}
                </div>
                <div className="flex items-center gap-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onModuleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* LESSONS LIST */}
            <div className="p-2 space-y-2 bg-zinc-50/30">
                {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-x-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 rounded-md ml-8 shadow-sm">
                        <GripVertical className="h-4 w-4 text-zinc-400" />
                        <FileVideo className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{lesson.title}</span>
                        <div className="ml-auto flex items-center gap-x-2">
                            {lesson.is_preview && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Gratuit
                                </span>
                            )}
                            <Link href={`${basePath}/courses/${courseId}/lessons/${lesson.id}`}>
                                <Button variant="ghost" size="sm">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}

                {isCreatingLesson ? (
                    <div className="ml-8 mt-2 flex gap-2">
                        <Input
                            placeholder="Titre de la leçon (ex: Introduction)"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onLessonCreate()}
                            autoFocus
                        />
                        <Button size="sm" onClick={onLessonCreate}>Ajouter</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsCreatingLesson(false)}>X</Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-8 mt-1 text-zinc-500 hover:text-indigo-600"
                        onClick={() => setIsCreatingLesson(true)}
                    >
                        <Plus className="h-3 w-3 mr-2" />
                        Ajouter une leçon
                    </Button>
                )}
            </div>
        </Card>
    )
}
