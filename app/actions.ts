'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Vérifier si le like existe déjà
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

    if (existingLike) {
        // Supprimer le like
        await supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id)
    } else {
        // Ajouter le like
        await supabase
            .from('likes')
            .insert({
                post_id: postId,
                user_id: user.id
            })
    }

    revalidatePath('/dashboard')
}

export async function fetchPosts(offset: number = 0, limit: number = 10, spaceId?: string, communityId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Récupérer les communautés dont l'utilisateur est membre
    const { data: myCommunityMemberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id)
        .neq('role', 'banned')

    const myCommunityIds = myCommunityMemberships?.map(c => c.community_id) || []

    // 2. Récupérer les espaces accessibles via les communautés (espaces publics)
    let publicSpacesQuery = supabase
        .from('spaces')
        .select('id')
        .eq('is_private', false)

    if (communityId) {
        // Si on est dans le contexte d'une communauté, on ne veut que les espaces de CETTE communauté
        publicSpacesQuery = publicSpacesQuery.eq('community_id', communityId)
    } else if (myCommunityIds.length > 0) {
        // Sinon, on prend tous les espaces publics de mes communautés
        publicSpacesQuery = publicSpacesQuery.in('community_id', myCommunityIds)
    } else {
        // Pas de communautés, pas d'espaces publics accessibles (sauf si on décide d'ouvrir tout ?)
        // Pour l'instant on garde la logique restrictive
    }

    const { data: publicSpaces } = await publicSpacesQuery
    let publicSpaceIds = publicSpaces?.map(s => s.id) || []

    // 3. Récupérer les espaces dont l'utilisateur est membre explicitement (pour les privés ou legacy)
    const { data: myDirectSpaces } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id)

    const myDirectSpaceIds = myDirectSpaces?.map(s => s.space_id) || []

    // Fusionner les accès et filtrer par communityId si nécessaire
    // Attention : myDirectSpaces peuvent être dans d'autres communautés.
    // Si communityId est défini, il faut vérifier que ces espaces appartiennent à la communauté.
    let accessibleSpaceIds = Array.from(new Set([...publicSpaceIds, ...myDirectSpaceIds]))

    if (communityId && accessibleSpaceIds.length > 0) {
        // Filtrer pour ne garder que les espaces de la communauté cible
        const { data: communitySpaces } = await supabase
            .from('spaces')
            .select('id')
            .eq('community_id', communityId)
            .in('id', accessibleSpaceIds)

        accessibleSpaceIds = communitySpaces?.map(s => s.id) || []
    }

    // 4. Récupérer les IDs des admins (pour les posts #Annonce)
    const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

    const adminIds = admins?.map(a => a.id) || []

    let query = supabase
        .from('posts')
        .select(`
            id,
            content,
            images,
            attachments,
            tags,
            created_at,
            author:profiles(name, avatar_url),
            space:spaces(name, slug),
            likes:likes(count),
            comments:comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    // Logique de filtrage
    if (spaceId) {
        // Validation d'accès à l'espace demandé
        const hasAccess = accessibleSpaceIds.includes(spaceId)

        // Si pas membre, on vérifie si c'est un post admin #Annonce
        // (Les annonces sont visibles globalement, donc aussi dans l'espace si on filtre par espace ?)
        // On garde la logique précédente : Annonce visible partout.

        if (hasAccess) {
            query = query.eq('space_id', spaceId)
        } else {
            // Pas accès, on cherche juste les annonces
            query = query.eq('space_id', spaceId).contains('tags', ['#Annonce']).in('author_id', adminIds)
        }
    } else {
        // Flux Global
        const conditions = []

        // Posts de mes espaces accessibles
        if (accessibleSpaceIds.length > 0) {
            conditions.push(`space_id.in.(${accessibleSpaceIds.join(',')})`)
        }

        // Posts #Annonce des admins
        if (adminIds.length > 0) {
            conditions.push(`and(tags.cs.{"#Annonce"},author_id.in.(${adminIds.join(',')}))`)
        }

        if (conditions.length > 0) {
            query = query.or(conditions.join(','))
        } else {
            return [] // Aucun accès
        }
    }

    const { data: posts, error } = await query

    if (error) {
        console.error('Error fetching posts:', error)
        return []
    }

    // Transformer les données pour le client
    return Promise.all(posts.map(async (post: any) => {
        let userHasLiked = false
        if (user) {
            const { count } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id)
                .eq('user_id', user.id)
            userHasLiked = count !== null && count > 0
        }

        return {
            ...post,
            likes_count: post.likes?.[0]?.count || 0,
            comments_count: post.comments?.[0]?.count || 0,
            user_has_liked: userHasLiked,
        }
    }))
}

export async function getSpaces() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('spaces')
        .select('id, name, slug')
        .order('name')

    return data || []
}

export async function createComment(postId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // 1. Créer le commentaire
    const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            author_id: user.id,
            content: content.trim(),
        })
        .select()
        .single()

    if (commentError) {
        throw new Error(commentError.message)
    }

    // 2. Récupérer l'auteur du post pour la notification
    const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()

    // 3. Créer la notification si nécessaire (pas d'auto-notification)
    if (post && post.author_id !== user.id) {
        await supabase
            .from('notifications')
            .insert({
                user_id: post.author_id,
                actor_id: user.id,
                type: 'comment',
                resource_id: postId,
                resource_type: 'post',
                content: 'a commenté votre publication',
            })
    }

    revalidatePath('/dashboard')
    return comment
}

export async function fetchNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('notifications')
        .select(`
            id,
            type,
            message,
            title,
            link,
            is_read,
            created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    return data || []
}

export async function markAllNotificationsAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    revalidatePath('/notifications')
}

export async function createReport(resourceId: string, resourceType: 'post' | 'comment', reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    if (resourceType === 'post') {
        const { error } = await supabase
            .from('post_reports')
            .insert({
                post_id: resourceId,
                reporter_id: user.id,
                reason,
                status: 'pending'
            })

        if (error) throw new Error(error.message)
    } else {
        // Fallback for other types if needed, or implement comment_reports later
        // For now, only post reports are fully supported in admin
        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                resource_id: resourceId,
                resource_type: resourceType,
                reason,
            })

        if (error) console.error('Error reporting other content:', error)
    }
}

export async function fetchReports() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []
    // Add check for admin/moderator role ideally

    const { data } = await supabase
        .from('reports')
        .select(`
            id,
            reason,
            created_at,
            reporter:profiles!reports_reporter_id_fkey(name),
            post:posts(content),
            comment:comments(content),
            resource_id,
            resource_type
        `)
        .order('created_at', { ascending: false })

    return data || []
}

export async function resolveReport(reportId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return // Add generic error handling or check

    await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

    revalidatePath('/admin')
}

export async function deleteReportedContent(reportId: string, resourceId: string, resourceType: 'post' | 'comment') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // 1. Delete content
    if (resourceType === 'post') {
        await supabase.from('posts').delete().eq('id', resourceId)
    } else if (resourceType === 'comment') {
        await supabase.from('comments').delete().eq('id', resourceId)
    }

    // 2. Delete report
    await supabase.from('reports').delete().eq('id', reportId)

    revalidatePath('/admin')
}

function extractHashtags(content: string): string[] {
    const regex = /#[\w\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/g
    const matches = content.match(regex)
    return matches || []
}

export async function getMySpaces() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Recuperer les espaces via space_members
    const { data: members } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id)

    const spaceIds = members?.map(m => m.space_id) || []

    // Aussi vérifier les espaces créés par l'utilisateur (s'il n'est pas membre explicitement pour une raison X)
    // Mais on préfère la table de membre.
    // Ajoutons la logique administrateur : les admins voient tous les espaces ?
    // "Empêche un Creator de poster dans l'espace d'un autre Creator." -> Donc Admin OK, Creator restreint.

    // Si Admin, on retourne tout ? 
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
        const { data: allSpaces } = await supabase.from('spaces').select('id, name, slug, community_id').order('name')
        return allSpaces || []
    }

    if (spaceIds.length === 0) return []

    const { data: spaces } = await supabase
        .from('spaces')
        .select('id, name, slug, community_id')
        .in('id', spaceIds)
        .order('name')

    return spaces || []
}

export async function createPost(spaceId: string, content: string, attachments: any[] = []) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Validation Membership
    // Check direct space membership
    const { data: member } = await supabase
        .from('space_members')
        .select('role')
        .eq('space_id', spaceId)
        .eq('user_id', user.id)
        .single()

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isGlobalAdmin = profile?.role === 'admin'

    let hasAccess = !!member || isGlobalAdmin

    // If not direct member, check if space is public and user is in community
    if (!hasAccess) {
        const { data: space } = await supabase
            .from('spaces')
            .select('community_id, is_private')
            .eq('id', spaceId)
            .single()

        if (space && !space.is_private && space.community_id) {
            const { data: communityMember } = await supabase
                .from('community_members')
                .select('id, role')
                .eq('community_id', space.community_id)
                .eq('user_id', user.id)
                .single()

            if (communityMember && communityMember.role !== 'banned') {
                hasAccess = true
            }
        }
    }

    if (!hasAccess) {
        throw new Error('Vous devez être membre de la communauté ou de cet espace pour poster.')
    }

    // 2. Création du Post
    const { data: post, error } = await supabase.from('posts').insert({
        space_id: spaceId,
        author_id: user.id,
        content: content.trim(),
        images: attachments.filter(a => a.type === 'image').map(a => a.url),
        attachments: attachments.length > 0 ? attachments : null,
        tags: extractHashtags(content)
    }).select().single()

    if (error) throw new Error(error.message)

    // 3. Gestion des Mentions
    console.log('Post Content:', content) // DEBUG
    const mentionedUserIds = extractMentions(content)
    console.log('Extracted Mentions:', mentionedUserIds) // DEBUG

    if (mentionedUserIds.length > 0) {
        const notifications = mentionedUserIds
            .filter(id => id !== user.id) // Pas d'auto-notification
            .map(mentionedId => ({
                user_id: mentionedId,
                actor_id: user.id, // Ajout de l'acteur si la table le supporte, sinon modifier la table ou le message
                type: 'mention',
                resource_id: post.id,
                resource_type: 'post',
                title: 'Nouvelle mention',
                message: 'vous a mentionné dans une publication',
                link: `/dashboard?post=${post.id}`, // Lien vers le post (à gérer dans le dashboard)
            }))

        if (notifications.length > 0) {
            console.log('Inserting notifications:', JSON.stringify(notifications, null, 2)) // DEBUG

            const { error: insertError } = await supabase.from('notifications').insert(notifications)

            if (insertError) {
                console.error('FAILED to insert notifications:', insertError)
            } else {
                console.log('SUCCESS: Notifications inserted.')
            }
        }
    }

    revalidatePath('/dashboard')
}

function extractMentions(content: string): string[] {
    const regex = /data-type="mention"[^>]*data-id="([^"]+)"/g
    const matches = []
    let match
    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1])
    }
    return [...new Set(matches)] // Unique IDs
}

export async function createCommunity(name: string, description: string, slug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Check if slug exists
    const { data: existing } = await supabase
        .from('communities')
        .select('id')
        .eq('slug', slug)
        .single()

    if (existing) throw new Error('Ce slug est déjà utilisé.')

    // 2. Insert Community
    const { data: community, error } = await supabase
        .from('communities')
        .insert({
            name,
            description,
            slug,
            creator_id: user.id
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    // 3. Add creator as first member (Admin role)
    const { error: memberError } = await supabase
        .from('community_members')
        .insert({
            community_id: community.id,
            user_id: user.id,
            role: 'admin'
        })

    if (memberError) {
        console.error('Error adding creator to community:', memberError)
    }

    revalidatePath('/creator/communities')
    return community
}

export async function fetchCommunities() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch communities I am a member of.
    const { data: myMemberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id)
        .neq('role', 'banned')

    const myCommunityIds = myMemberships?.map(m => m.community_id) || []

    // If admin, show all? Maybe. For now stick to membership.
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
        const { data: allCommunities } = await supabase
            .from('communities')
            .select(`
                id,
                name,
                slug,
                description,
                logo_url,
                community_members(count),
                spaces:spaces(id, name, slug, is_private)
            `)
            .order('name')

        return allCommunities?.map(c => ({
            ...c,
            members_count: c.community_members?.[0]?.count || 0
        })) || []
    }

    if (myCommunityIds.length === 0) return []

    const { data: communities } = await supabase
        .from('communities')
        .select(`
            id,
            name,
            slug,
            description,
            logo_url,
            community_members(count),
            spaces:spaces(id, name, slug, is_private)
        `)
        .in('id', myCommunityIds)
        .order('name')

    return communities?.map(c => ({
        ...c,
        members_count: c.community_members?.[0]?.count || 0
    })) || []
}

export async function getSidebarData(spaceId?: string, coursePath?: string) {
    const supabase = await createClient()

    let members: any[] = []
    let events: any[] = []
    let modules: any[] = []

    // 1. Community Context (Space)
    if (spaceId) {
        // Fetch Members
        const { data: membersData } = await supabase
            .from('space_members')
            .select('profile:profiles(id, name, avatar_url)')
            .eq('space_id', spaceId)
            .limit(10)
        members = membersData?.map((m: any) => m.profile) || []

        // Fetch Community Events
        const { data: space } = await supabase.from('spaces').select('community_id').eq('id', spaceId).single()
        if (space?.community_id) {
            const { data: eventsData } = await supabase
                .from('events')
                .select('*')
                .eq('community_id', space.community_id)
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(3)
            events = eventsData || []
        }
    }
    // 2. Global Dashboard (No Space) -> Fetch all future events
    else if (!coursePath) {
        const { data: eventsData } = await supabase
            .from('events')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3)
        events = eventsData || []
    }

    // 3. Course Context
    if (coursePath) {
        // Extract slug from path /courses/[slug]
        const slug = coursePath.split('/courses/')[1]?.split('/')[0]
        if (slug) {
            // Fetch Course Modules
            const { data: course } = await supabase.from('courses').select('id').eq('slug', slug).single()
            if (course) {
                const { data: modulesData } = await supabase
                    .from('modules')
                    .select('id, title, position')
                    .eq('course_id', course.id)
                    .order('position', { ascending: true })
                modules = modulesData || []
            }
        }
    }

    return { members, events, modules }
}

export async function getCommunityBySlug(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('communities')
        .select(`
            id,
            name,
            slug,
            description,
            logo_url,
            spaces:spaces(id, name, slug, is_private, community_id)
        `)
        .eq('slug', slug)
        .single()

    return data
}

