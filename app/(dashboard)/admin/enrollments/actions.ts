'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelEnrollment(enrollmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error("Permission denied")

    const { error } = await supabase
        .from('enrollments')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId)

    if (error) throw error
    revalidatePath('/admin/enrollments')
}

export async function createManualEnrollment(userId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error("Permission denied")

    const { error } = await supabase.from('enrollments').insert({
        user_id: userId,
        course_id: courseId,
        status: 'active',
        payment_provider: 'manual',
    })

    if (error) throw error
    revalidatePath('/admin/enrollments')
}
