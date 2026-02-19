'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCommunityBranding(
    communityId: string,
    data: {
        logo_url?: string,
        primary_color?: string,
        favicon_url?: string
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('communities')
        .update(data)
        .eq('id', communityId)

    if (error) throw error

    revalidatePath(`/creator/communities/${communityId}/branding`)
    revalidatePath(`/c/${communityId}`) // For the future public branding
}

// Re-export or Proxy createInvitation if it exists in invitations.ts, or verify if I should just implement it here.
// The user error says "getInvitations is not a function", implying it's missing from the import.

// Let's implement them here for simplicity and to fix the immediate error.

export async function getInvitations(communityId: string) {
    const supabase = await createClient()

    // Fetch invitations for this community
    // We assume the table is 'community_invitations' based on invitations.ts
    const { data: invitations, error } = await supabase
        .from('community_invitations')
        .select(`
            *
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching invitations:", error)
        return []
    }

    return invitations || []
}

export async function createInvitation(communityId: string, email?: string, role: string = 'member') {
    // We can call the one from invitations.ts or implement here.
    // Let's import to avoid duplication if invitations.ts is used elsewhere.
    // But since I cannot easily change the import in other files without knowing where else it is used,
    // and the error is specifically about actions.ts...

    // Actually, let's implement the logic here to be safe and self-contained in this action file which seems to be the main entry point for the UI.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Basic permission check
    const { data: membership } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    // Creator check
    const { data: community } = await supabase
        .from('communities')
        .select('creator_id')
        .eq('id', communityId)
        .single()

    const isCreator = community?.creator_id === user.id
    const isAdmin = membership?.role === 'admin'

    if (!isCreator && !isAdmin) {
        throw new Error('Permission denied')
    }

    // Generate token
    // We need nanoid, but it might be ESM only. usage of crypto.randomUUID() is safer in edge/server actions usually?
    // Let's use crypto.randomUUID for simplicity if nanoid is an issue, or just import nanoid if project uses it.
    // The existing invocations.ts used nanoid.

    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const { error } = await supabase.from('community_invitations').insert({
        community_id: communityId,
        email: email || null,
        token: token, // Using our generated token
        role: role,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
    })

    if (error) throw error
    revalidatePath(`/creator/communities/${communityId}/settings`)
    return { token }
}

export async function revokeInvitation(invitationId: string, communityId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('community_invitations')
        .delete()
        .eq('id', invitationId)

    if (error) throw error
    revalidatePath(`/creator/communities/${communityId}/settings`)
}

export async function updateCommunity(communityId: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const { error } = await supabase
        .from('communities')
        .update({ name, description })
        .eq('id', communityId)

    if (error) throw error
    revalidatePath(`/creator/communities/${communityId}/settings`)
    revalidatePath(`/c/${communityId}`)
}

export async function deleteCommunity(communityId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId)

    if (error) throw error
    // Redirect is handled in client component usually, or here?
    // CommunitySettingsForm does router.push('/creator/communities')
    // so we just need to return success.
}

export async function createSpace(communityId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Non autorisé")

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const isPrivate = formData.get('is_private_value') === 'true'
    const accentColor = formData.get('accent_color') as string
    const icon = formData.get('icon') as string
    const welcomeMessage = formData.get('welcome_message') as string
    const type = formData.get('type') as string || 'text'

    if (!['text', 'voice'].includes(type)) {
        throw new Error("Type d'espace invalide")
    }

    const { data, error } = await supabase
        .from('spaces')
        .insert({
            community_id: communityId,
            name,
            slug,
            description,
            is_private: isPrivate,
            accent_color: accentColor,
            icon,
            welcome_message: welcomeMessage,
            type: type,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating space:", error)
        throw new Error(error.message)
    }

    await supabase.from('space_members').insert({
        space_id: data.id,
        user_id: user.id,
        role: 'admin'
    })

    revalidatePath(`/creator/communities`)
    return data
}

export async function removeMember(communityId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Verify creator/admin permission
    const { data: requesterRole } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    const { data: community } = await supabase
        .from('communities')
        .select('creator_id')
        .eq('id', communityId)
        .single()

    const isCreator = community?.creator_id === user.id
    const isAdmin = requesterRole?.role === 'admin'

    if (!isCreator && !isAdmin) {
        throw new Error("Permission denied")
    }

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId)

    if (error) throw error
    revalidatePath(`/creator/communities/${communityId}/members`)
}

export async function updateMemberRole(communityId: string, userId: string, newRole: 'admin' | 'moderator' | 'member') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Verify creator/admin permission
    const { data: requesterRole } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

    const { data: community } = await supabase
        .from('communities')
        .select('creator_id')
        .eq('id', communityId)
        .single()

    const isCreator = community?.creator_id === user.id
    // Only creator can promote to admin? Or admins can promote to moderator?
    // Simplified: Creator and Admins can manage roles.
    const isAdmin = requesterRole?.role === 'admin'

    if (!isCreator && !isAdmin) {
        throw new Error("Permission denied")
    }

    const { error } = await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('community_id', communityId)
        .eq('user_id', userId)

    if (error) throw error
    revalidatePath(`/creator/communities/${communityId}/members`)
}

export async function updateSpace(spaceId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Verify creator/admin permission (TODO: strict check)
    // For now, assuming RLS handles strict security or we trust the creator route protection

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const isPrivate = formData.get('is_private_value') === 'true'
    const accentColor = formData.get('accent_color') as string
    const icon = formData.get('icon') as string
    const welcomeMessage = formData.get('welcome_message') as string

    const { error } = await supabase
        .from('spaces')
        .update({
            name,
            slug,
            description,
            is_private: isPrivate,
            accent_color: accentColor,
            icon,
            welcome_message: welcomeMessage
        })
        .eq('id', spaceId)

    if (error) throw error
    revalidatePath(`/creator/communities`)
}

export async function deleteSpace(spaceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', spaceId)

    if (error) throw error
    revalidatePath(`/creator/communities`)
}
