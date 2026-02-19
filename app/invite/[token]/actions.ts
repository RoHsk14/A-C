'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function acceptInvitation(token: string) {
    try {
        const supabase = await createClient()

        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { error: 'Vous devez être connecté pour accepter une invitation.' }
        }

        // 2. Get Invitation Details
        // Use RPC to bypass RLS for reading invitation details (since user might not be member yet)
        let inviteRecord;
        try {
            const { data, error } = await supabase.rpc('get_invitation_by_token', { lookup_token: token })
            if (error) throw error
            inviteRecord = data && data.length > 0 ? data[0] : null
        } catch (e) {
            console.error("Error fetching invitation via RPC:", e)
            // Fallback to direct query (might fail due to RLS if not creator/admin)
            const { data, error } = await supabase
                .from('community_invitations')
                .select(`
                    *,
                    community:communities(id, slug, name)
                `)
                .eq('token', token)
                .single()

            if (data) {
                inviteRecord = {
                    ...data,
                    community_id: data.community.id,
                    community_slug: data.community.slug
                }
            }
        }

        if (!inviteRecord) {
            return { error: 'Invitation invalide ou introuvable.' }
        }

        // Check expiration
        if (new Date(inviteRecord.expires_at) < new Date()) {
            return { error: 'Cette invitation a expiré.' }
        }

        // Check Email Restriction
        if (inviteRecord.email) {
            if (user.email !== inviteRecord.email) {
                return { error: `Cette invitation est réservée à l'adresse ${inviteRecord.email}. Vous êtes connecté en tant que ${user.email}.` }
            }
        }

        // 3. Add to Community Members
        // Check if already member
        const { data: existingMember } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', inviteRecord.community_id)
            .eq('user_id', user.id)
            .single()

        if (!existingMember) {
            const { error: memberError } = await supabase
                .from('community_members')
                .insert({
                    community_id: inviteRecord.community_id,
                    user_id: user.id,
                    role: inviteRecord.role || 'member',
                    joined_at: new Date().toISOString()
                })

            if (memberError) {
                console.error('Error adding member:', memberError)
                return { error: 'Erreur lors de l\'ajout à la communauté.' }
            }

            // --- AUTO-ENROLL IN FREE COURSES ---
            try {
                // Find all free courses for this community
                const { data: freeCourses } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('community_id', inviteRecord.community_id)
                    .eq('price_xof', 0)
                    .eq('is_published', true)

                if (freeCourses && freeCourses.length > 0) {
                    const enrollmentsToCreate = freeCourses.map(course => ({
                        user_id: user.id,
                        course_id: course.id,
                        status: 'active',
                        amount_paid: 0,
                        currency: 'XOF'
                    }))

                    const { error: enrollError } = await supabase
                        .from('enrollments')
                        .insert(enrollmentsToCreate)

                    if (enrollError) {
                        console.error('Failed to auto-enroll in free courses:', enrollError)
                    } else {
                        console.log(`User ${user.id} auto-enrolled in ${freeCourses.length} free courses for community ${inviteRecord.community_id}`)
                    }
                }
            } catch (err) {
                console.error('Error in auto-enroll logic:', err)
            }
            // -----------------------------------
        }

        // 4. Mark Accepted / Delete
        if (inviteRecord.email) {
            // Safe delete via RPC
            const { error: deleteError } = await supabase.rpc('delete_invitation_by_id', { invite_id: inviteRecord.id })
            if (deleteError) {
                console.error("Error deleting invitation via RPC:", deleteError)
                // Try direct delete as fallback (will fail if RLS not updating)
                await supabase.from('community_invitations').delete().eq('id', inviteRecord.id)
            }
        } else {
            // Generic link - update usage stats or accepted_at? 
            // Logic before was just updating accepted_at.
            await supabase
                .from('community_invitations')
                .update({ accepted_at: new Date().toISOString() })
                .eq('id', inviteRecord.id)
        }

        revalidatePath('/dashboard')

        return { success: true, slug: inviteRecord.community_slug }
    } catch (error: any) {
        console.error('Unexpected error in acceptInvitation:', error)
        return { error: error.message || 'Une erreur inattendue est survenue.' }
    }
}
