'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// MODULES

export async function createModule(courseId: string, title: string) {
    const supabase = await createClient()

    // Get max order index
    const { data: maxOrder } = await supabase
        .from('modules')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

    const newOrder = maxOrder ? maxOrder.order_index + 1 : 0

    const { data, error } = await supabase
        .from('modules')
        .insert({
            course_id: courseId,
            title: title,
            order_index: newOrder
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath(`/creator/courses/${courseId}/builder`)
    return data
}

export async function updateModule(moduleId: string, title: string, courseId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('modules')
        .update({ title })
        .eq('id', moduleId)

    if (error) throw error
    revalidatePath(`/creator/courses/${courseId}/builder`)
}

export async function deleteModule(moduleId: string, courseId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId)

    if (error) throw error
    revalidatePath(`/creator/courses/${courseId}/builder`)
}

export async function reorderModules(list: { id: string; order_index: number }[], courseId: string) {
    const supabase = await createClient()

    for (const item of list) {
        await supabase
            .from('modules')
            .update({ order_index: item.order_index })
            .eq('id', item.id)
    }

    revalidatePath(`/creator/courses/${courseId}/builder`)
}

// LESSONS

export async function createLesson(moduleId: string, title: string, courseId: string) {
    const supabase = await createClient()

    // Get max order for lessons in this module
    const { data: maxOrder } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

    const newOrder = maxOrder ? maxOrder.order_index + 1 : 0

    const { data, error } = await supabase
        .from('lessons')
        .insert({
            module_id: moduleId,
            course_id: courseId,
            title: title,
            order_index: newOrder
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath(`/creator/courses/${courseId}/builder`)
    return data
}

export async function reorderLessons(list: { id: string; order_index: number; module_id: string }[], courseId: string) {
    const supabase = await createClient()

    for (const item of list) {
        await supabase
            .from('lessons')
            .update({
                order_index: item.order_index,
                module_id: item.module_id
            })
            .eq('id', item.id)
    }
    revalidatePath(`/creator/courses/${courseId}/builder`)
}

export async function updateLesson(lessonId: string, values: any, courseId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('lessons')
        .update(values)
        .eq('id', lessonId)

    if (error) throw error
    revalidatePath(`/creator/courses/${courseId}/builder`)
    revalidatePath(`/creator/courses/${courseId}/lessons/${lessonId}`)
}

// PUBLISH

export async function togglePublish(courseId: string, currentState: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentState })
        .eq('id', courseId)

    if (error) throw error
    revalidatePath(`/creator/courses/${courseId}/builder`)
    revalidatePath(`/courses`)
    revalidatePath(`/creator/courses`)
}
