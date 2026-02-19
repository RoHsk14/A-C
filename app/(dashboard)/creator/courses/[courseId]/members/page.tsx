import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EnrollmentActions } from '@/components/admin/enrollment-actions'
import { Search, UserPlus, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CourseMembersPage({ params }: { params: { courseId: string } }) {
    const supabase = await createClient()
    const { courseId } = params

    // 1. Verify Access & Fetch Course
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return notFound()

    // Retrieve course and verify ownership (for creators) or admin status
    const { data: course } = await supabase
        .from('courses')
        .select('id, title, instructor_id')
        .eq('id', courseId)
        .single()

    if (!course) return notFound()

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    const isOwner = course.instructor_id === user.id

    if (!isAdmin && !isOwner) {
        return (
            <div className="p-8 text-center text-red-600">
                Vous n'êtes pas autorisé à gérer les membres de ce cours.
            </div>
        )
    }

    // 2. Fetch Enrollments for this course
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            id,
            status,
            enrolled_at,
            user:profiles!enrollments_user_id_fkey (
                id,
                name,
                email,
                avatar_url
            )
        `)
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false })

    const activeEnrollments = enrollments?.filter(e => e.status === 'active') || []
    const otherEnrollments = enrollments?.filter(e => e.status !== 'active') || []

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Membres du cours</h1>
                    <p className="text-muted-foreground">
                        {course.title} • {activeEnrollments.length} membre(s) actif(s)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/creator/courses`}>Retour aux cours</Link>
                    </Button>
                    {/* Placeholder for future "Invite by Email" feature */}
                    <Button variant="brand">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Ajouter un membre
                    </Button>
                </div>
            </div>

            {/* Active Members Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Membres Actifs</CardTitle>
                    <CardDescription>
                        Utilisateurs ayant accès au contenu et à la communauté.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1 mb-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher un membre..."
                                className="pl-9 w-full md:w-[300px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activeEnrollments.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
                                Aucun membre actif pour le moment.
                            </p>
                        ) : (
                            activeEnrollments.map((enrollment: any) => (
                                <div
                                    key={enrollment.id}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border border-zinc-200">
                                            <AvatarImage src={enrollment.user?.avatar_url} />
                                            <AvatarFallback>{enrollment.user?.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{enrollment.user?.name || 'Inconnu'}</p>
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <span className="flex items-center">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {enrollment.user?.email}
                                                </span>
                                                <span className="hidden md:flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Dpuis le {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            Actif
                                        </Badge>
                                        <EnrollmentActions
                                            enrollmentId={enrollment.id}
                                            status={enrollment.status}
                                            userName={enrollment.user?.name}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Inactive/Past Members */}
            {otherEnrollments.length > 0 && (
                <Card className="opacity-80">
                    <CardHeader>
                        <CardTitle className="text-base text-muted-foreground">Anciens Membres / Annulés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {otherEnrollments.map((enrollment: any) => (
                                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                    <div className="flex items-center gap-3 opacity-60">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{enrollment.user?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{enrollment.user?.name}</p>
                                            <p className="text-xs">{enrollment.status}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{enrollment.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
