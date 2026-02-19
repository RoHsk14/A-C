'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

/**
 * Cached user profile fetcher
 * React will deduplicate this across the entire request
 */
export const getCachedUserProfile = cache(async (userId: string) => {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url, role')
        .eq('id', userId)
        .single()

    return profile
})

/**
 * Cached current user fetcher
 */
export const getCachedCurrentUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
})

/**
 * Cached communities fetcher
 */
export const getCachedCommunities = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch communities I am a member of
    const { data: myMemberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id)
        .neq('role', 'banned')

    const myCommunityIds = myMemberships?.map(m => m.community_id) || []

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role === 'admin') {
        const { data: allCommunities } = await supabase
            .from('communities')
            .select(`
                id,
                name,
                slug,
                description,
                spaces:spaces(id, name, slug, is_private)
            `)
            .order('name')
        return allCommunities || []
    }

    if (myCommunityIds.length === 0) return []

    const { data: communities } = await supabase
        .from('communities')
        .select(`
            id,
            name,
            slug,
            description,
            spaces:spaces(id, name, slug, is_private)
        `)
        .in('id', myCommunityIds)
        .order('name')

    return communities || []
})

export const getCachedCommunity = cache(async (slug: string) => {
    const supabase = await createClient()

    // Fetch community with spaces
    const { data: community } = await supabase
        .from('communities')
        .select(`
            id,
            name,
            slug,
            description,
            logo_url,
            primary_color,
            favicon_url,
            spaces:spaces(id, name, slug, is_private)
        `)
        .eq('slug', slug)
        .single()

    return community
})
