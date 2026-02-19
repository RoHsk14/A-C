'use server'

import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

export async function createInvitation(communityId: string, email?: string, role: string = 'member') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Verify permission (Creator)
    const { data: community } = await supabase.from('communities').select('creator_id').eq('id', communityId).single()
    const isOwner = community?.creator_id === user.id

    // Check if user is admin member?
    // For now stick to Creator
    if (!isOwner) {
        // Check if admin member
        const { data: member } = await supabase.from('community_members').select('role').eq('community_id', communityId).eq('user_id', user.id).single()
        if (member?.role !== 'admin') {
            throw new Error('Permission denied')
        }
    }

    const token = nanoid(32) // Secure random token
    // Expires in 7 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error } = await supabase.from('community_invitations').insert({
        community_id: communityId,
        email: email || null, // Optional
        token,
        role,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
    })

    if (error) {
        console.error('Error creating invitation:', error)
        throw new Error('Failed to create invitation')
    }

    return { token }
}
