'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeOnboarding(courseId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Upsert to ensure we don't duplicate if race condition, 
    // though strict equality check on ID usually preferred.
    // Database has UNIQUE(user_id, course_id) constraint.

    // We update or insert.
    const { error } = await supabase
        .from('onboarding_status')
        .upsert({
            user_id: user.id,
            course_id: courseId,
            completed: true,
            completed_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, course_id'
        })

    if (error) {
        console.error('Error completing onboarding:', error)
        throw new Error('Failed to complete onboarding')
    }

    revalidatePath(`/courses`)
    // We might want to revalidate the specific course page, 
    // but we don't have the slug here easily unless passed.
    // Ideally we return success and client refreshes or we use a tag.
}

/**
 * Mark course as completed
 */
export async function completeCourse(courseId: string, courseSlug: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non autorisé')

    // Get enrollment
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (!enrollment) {
        throw new Error('Inscription introuvable')
    }

    // Update enrollment to completed
    const { error } = await supabase
        .from('enrollments')
        .update({
            completed_at: new Date().toISOString()
        })
        .eq('id', enrollment.id)

    if (error) {
        console.error('Error completing course:', error)
        throw new Error('Erreur lors de la finalisation du cours')
    }

    revalidatePath(`/courses/${courseSlug}`)
    return { success: true }
}

export async function joinCourse(courseId: string, courseSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/login?redirect=/courses/${courseSlug}`)
    }

    // 1. Get Course Details (Price & Community)
    const { data: course } = await supabase
        .from('courses')
        .select('price_xof, community_id')
        .eq('id', courseId)
        .single()

    if (!course) {
        throw new Error('Course not found')
    }

    // 2. Check if Free
    if (course.price_xof > 0) {
        // If not free, we should ideally redirect to checkout, but here we just return error or handle it client side
        // For now, assume this action is only called for free courses or after payment (but payment has webhook)
        throw new Error('This course is not free.')
    }

    // 3. Create Enrollment
    const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
            user_id: user.id,
            course_id: courseId,
            status: 'active', // Free courses are active immediately
            amount_paid: 0,
            currency: 'XOF'
        })
        .select()
        .single()

    if (enrollError) {
        // Check for duplicates
        if (enrollError.code === '23505') { // Unique violation
            return { success: true, message: 'Already enrolled' }
        }
        console.error('Enrollment error:', enrollError)
        throw new Error('Failed to join course')
    }

    // 4. Auto-Join Community
    if (course.community_id) {
        try {
            const { data: existingMember } = await supabase
                .from('community_members')
                .select('id')
                .eq('community_id', course.community_id)
                .eq('user_id', user.id)
                .single()

            if (!existingMember) {
                await supabase
                    .from('community_members')
                    .insert({
                        community_id: course.community_id,
                        user_id: user.id,
                        role: 'member'
                    })
            }
        } catch (err) {
            console.error('Auto-join community error:', err)
            // Continue even if this fails
        }
    }

    revalidatePath(`/courses/${courseSlug}`)
    return { success: true }
}
