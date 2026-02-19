'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { subDays, startOfDay, endOfDay, format } from 'date-fns'

/**
 * Check if current user is admin
 */
async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/access-denied')
    }

    return { supabase, user }
}

/**
 * Get dashboard statistics
 */
export async function getStats() {
    const { supabase } = await requireAdmin()

    // Total members
    const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // New members in last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30)
    const { count: newMembers30d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

    // Previous 30 days for comparison
    const sixtyDaysAgo = subDays(new Date(), 60)
    const { count: previousPeriodMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())

    // Calculate percentage change
    const percentageChange = previousPeriodMembers && previousPeriodMembers > 0
        ? ((newMembers30d || 0) - previousPeriodMembers) / previousPeriodMembers * 100
        : 0

    // Weekly activity (posts created this week)
    const sevenDaysAgo = subDays(new Date(), 7)
    const { count: weeklyPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

    return {
        totalMembers: totalMembers || 0,
        newMembers30d: newMembers30d || 0,
        percentageChange: Math.round(percentageChange),
        weeklyActivity: weeklyPosts || 0,
        revenue: 0 // Placeholder for future implementation
    }
}

/**
 * Get user growth analytics
 */
export async function getAnalytics(period: '7d' | '30d' | 'all' = '30d') {
    const { supabase } = await requireAdmin()

    let startDate: Date
    switch (period) {
        case '7d':
            startDate = subDays(new Date(), 7)
            break
        case '30d':
            startDate = subDays(new Date(), 30)
            break
        case 'all':
            startDate = new Date('2020-01-01') // Far past date
            break
    }

    // Fetch all users created since startDate
    const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    if (!users) return []

    // Group by date
    const groupedData: { [key: string]: number } = {}

    users.forEach(user => {
        const date = format(new Date(user.created_at), 'yyyy-MM-dd')
        groupedData[date] = (groupedData[date] || 0) + 1
    })

    // Convert to cumulative array
    let cumulative = 0
    const chartData = Object.entries(groupedData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => {
            cumulative += count
            return {
                date,
                users: cumulative,
                newUsers: count
            }
        })

    return chartData
}

/**
 * Get all users with pagination and filters
 */
export async function getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    roleFilter?: string
) {
    const { supabase } = await requireAdmin()

    let query = supabase
        .from('profiles')
        .select('id, name, email, role, created_at, avatar_url', { count: 'exact' })
        .order('created_at', { ascending: false })

    // Apply search filter
    if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: users, count, error } = await query

    if (error) {
        console.error('Error fetching users:', error)
        return { users: [], total: 0, pages: 0 }
    }

    return {
        users: users || [],
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
    }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: 'admin' | 'creator' | 'member') {
    const { supabase, user: currentUser } = await requireAdmin()

    // Prevent self-demotion
    if (userId === currentUser.id && newRole !== 'admin') {
        throw new Error('Vous ne pouvez pas modifier votre propre rôle.')
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) {
        console.error('Error updating role:', error)
        throw new Error('Erreur lors de la mise à jour du rôle.')
    }

    revalidatePath('/admin/users')
    return { success: true }
}

/**
 * Toggle user account status (enable/disable)
 * Note: Supabase doesn't have a built-in "disable" feature for users
 * We'll use a custom field or role-based approach
 */
export async function toggleUserStatus(userId: string) {
    const { supabase, user: currentUser } = await requireAdmin()

    // Prevent self-disable
    if (userId === currentUser.id) {
        throw new Error('Vous ne pouvez pas désactiver votre propre compte.')
    }

    // For now, we'll change role to 'banned' to simulate disabling
    // In production, you might want a separate 'is_active' field
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    const newRole = profile?.role === 'banned' ? 'member' : 'banned'

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) {
        console.error('Error toggling user status:', error)
        throw new Error('Erreur lors de la modification du statut.')
    }

    revalidatePath('/admin/users')
    return { success: true, newStatus: newRole === 'banned' ? 'disabled' : 'active' }
}

/**
 * Reset user password (placeholder)
 * Note: Supabase handles password resets via email
 */
export async function sendPasswordReset(email: string) {
    await requireAdmin()

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })

    if (error) {
        console.error('Error sending password reset:', error)
        throw new Error('Erreur lors de l\'envoi du lien de réinitialisation.')
    }

    return { success: true }
}

/**
 * Get detailed user profile (360 view)
 */
export async function getUserProfile(userId: string) {
    const { supabase } = await requireAdmin()

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (!profile) {
        throw new Error('Utilisateur introuvable')
    }

    // Get user's posts to count likes received
    const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', userId)

    const postIds = userPosts?.map(p => p.id) || []

    // Get user stats in parallel
    const [
        { count: postsCount },
        { count: likesGiven },
        { count: likesReceived },
        { data: enrollments }
    ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        // Count likes on user's posts
        postIds.length > 0
            ? supabase.from('likes').select('*', { count: 'exact', head: true }).in('post_id', postIds)
            : { count: 0 },
        supabase.from('enrollments').select(`
            *,
            course:courses(id, title, thumbnail_url)
        `).eq('user_id', userId)
    ])

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
        (enrollments || []).map(async (enrollment: any) => {
            // Get all lessons for this course
            const { data: courseLessons } = await supabase
                .from('lessons')
                .select('id')
                .eq('course_id', enrollment.course_id)

            const lessonIds = courseLessons?.map(l => l.id) || []
            const totalLessons = lessonIds.length

            // Get completed lessons for this user and course
            let completedLessons = 0
            if (lessonIds.length > 0) {
                const { count } = await supabase
                    .from('completed_lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .in('lesson_id', lessonIds)

                completedLessons = count || 0
            }

            const progress = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0

            return {
                ...enrollment,
                progress
            }
        })
    )

    return {
        profile,
        stats: {
            postsCount: postsCount || 0,
            likesGiven: likesGiven || 0,
            likesReceived: likesReceived || 0
        },
        enrollments: enrollmentsWithProgress
    }
}

/**
 * Get all courses with stats
 */
export async function getCourses() {
    const { supabase } = await requireAdmin()

    const { data: courses, error } = await supabase
        .from('courses')
        .select(`
            id,
            title,
            slug,
            is_published,
            thumbnail_url,
            created_at,
            creator:profiles!courses_instructor_id_fkey(id, name, avatar_url),
            enrollments:enrollments(count)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching courses:', error)
    }

    return courses || []
}

/**
 * Get all communities with stats
 */
export async function getCommunities() {
    const { supabase } = await requireAdmin()

    const { data: communities, error } = await supabase
        .from('communities')
        .select(`
            id,
            name,
            slug,
            description,
            created_at,
            creator_id
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching communities:', error)
        return []
    }

    // Fetch creator profiles separately
    const creatorIds = communities?.map(c => c.creator_id).filter(Boolean) || []
    const { data: creators } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', creatorIds)

    // Fetch member counts
    const communityIds = communities?.map(c => c.id) || []
    const { data: memberCounts } = await supabase
        .from('community_members')
        .select('community_id')
        .in('community_id', communityIds)

    // Fetch space counts
    const { data: spaceCounts } = await supabase
        .from('spaces')
        .select('community_id')
        .in('community_id', communityIds)

    // Combine data
    const communitiesWithData = communities?.map(community => {
        const creator = creators?.find(c => c.id === community.creator_id)
        const memberCount = memberCounts?.filter(m => m.community_id === community.id).length || 0
        const spaceCount = spaceCounts?.filter(s => s.community_id === community.id).length || 0

        return {
            ...community,
            creator,
            members: [{ count: memberCount }],
            spaces: [{ count: spaceCount }]
        }
    }) || []

    return communitiesWithData
}

/**
 * Get all spaces with activity stats
 */
export async function getSpaces() {
    const { supabase } = await requireAdmin()

    const { data: spaces } = await supabase
        .from('spaces')
        .select(`
            id,
            name,
            slug,
            is_private,
            created_at,
            community:communities(id, name),
            posts:posts(count)
        `)
        .order('created_at', { ascending: false })

    return spaces || []
}

/**
 * Get reported posts for moderation
 */
/**
 * Get reported posts for moderation
 */
export async function getReportedPosts() {
    const { supabase } = await requireAdmin()

    const { data: reports, error } = await supabase
        .from('post_reports')
        .select(`
            *,
            post:posts!post_reports_post_id_fkey(
                id,
                content,
                created_at,
                author:profiles!posts_author_id_fkey(id, name, avatar_url)
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reports:', error)
        return []
    }

    // Manually fetch reporters since there is no FK
    const reporterIds = reports?.map(r => r.reporter_id).filter(Boolean) || []

    if (reporterIds.length > 0) {
        const { data: reporters } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', reporterIds)

        return reports?.map(report => ({
            ...report,
            reporter: reporters?.find(r => r.id === report.reporter_id)
        })) || []
    }

    return reports || []
}

/**
 * Handle moderation report
 */
export async function handleReport(
    reportId: string,
    action: 'ignore' | 'delete' | 'warn',
    adminNote?: string
) {
    const { supabase, user } = await requireAdmin()

    // Get report details
    const { data: report } = await supabase
        .from('post_reports')
        .select('*, post:posts!post_reports_post_id_fkey(id, author_id)')
        .eq('id', reportId)
        .single()

    if (!report) {
        throw new Error('Signalement introuvable')
    }

    // Handle action
    if (action === 'delete') {
        // Send notification to author
        if (report.post?.author_id) {
            await supabase.from('notifications').insert({
                user_id: report.post.author_id,
                type: 'system_alert',
                title: 'Publication supprimée',
                message: `Votre publication a été supprimée suite à un signalement validé par la modération. ${adminNote ? `Note du modérateur : ${adminNote}` : 'Veuillez respecter les règles de la communauté.'}`,
                link: '/community-rules', // Optional link to rules since post is gone
                is_read: false
            })
        }

        // Delete the post
        await supabase.from('posts').delete().eq('id', report.post_id)
        await logAdminAction('delete_post', 'posts', report.post_id, { reason: 'moderation', reportId })
    } else if (action === 'warn') {
        // Send warning notification to author
        if (report.post?.author_id) {
            await supabase.from('notifications').insert({
                user_id: report.post.author_id,
                type: 'system_alert', // You might need to add this type to your check constraint or use a generic one
                title: 'Avertissement de modération',
                message: `Votre publication a été signalée et examinée. ${adminNote ? `Note du modérateur : ${adminNote}` : 'Veuillez respecter les règles de la communauté.'}`,
                link: `/post/${report.post_id}`, // Link to the post if it still exists
                is_read: false
            })
        }
        await logAdminAction('warn_user', 'profiles', report.post?.author_id, { reportId, reason: report.reason })
    }

    // Update report status
    await supabase
        .from('post_reports')
        .update({
            status: action === 'ignore' ? 'ignored' : 'resolved',
            admin_note: adminNote,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
        })
        .eq('id', reportId)

    revalidatePath('/admin/moderation')
    return { success: true }
}

/**
 * Log admin action
 */
export async function logAdminAction(
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any
) {
    const { supabase, user } = await requireAdmin()

    await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details
    })
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
    page: number = 1,
    limit: number = 50,
    actionFilter?: string
) {
    const { supabase } = await requireAdmin()

    let query = supabase
        .from('audit_logs')
        .select(`
            *,
            admin:profiles!audit_logs_admin_id_fkey(id, name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

    if (actionFilter && actionFilter !== 'all') {
        query = query.eq('action', actionFilter)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: logs, count } = await query

    return {
        logs: logs || [],
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
    }
}
