import { getUserProfile } from '@/app/admin/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileText, Heart, Calendar, BookOpen, Shield, Ban, ArrowLeft, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export default async function UserProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { profile, stats, enrollments } = await getUserProfile(id)

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { color: string }> = {
            admin: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
            creator: { color: 'bg-orange-100 text-orange-700 border-orange-200' },
            member: { color: 'bg-slate-100 text-slate-700 border-slate-200' },
            banned: { color: 'bg-red-100 text-red-700 border-red-200' }
        }
        const config = variants[role] || variants.member

        return (
            <Badge className={`capitalize ${config.color} border`}>
                {role}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux utilisateurs
                </Button>
            </Link>

            {/* Header Card */}
            <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-4 border-slate-100">
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-semibold">
                                    {profile.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {profile.name || 'Sans nom'}
                                </h1>
                                <p className="text-slate-500 mt-1">{profile.email}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    {getRoleBadge(profile.role)}
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        Inscrit le {format(new Date(profile.created_at), 'dd MMM yyyy', { locale: fr })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Actions */}
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Mail className="h-4 w-4" />
                                Réinitialiser MDP
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Shield className="h-4 w-4" />
                                Modifier le rôle
                            </Button>
                            <Button variant="destructive" className="gap-2">
                                <Ban className="h-4 w-4" />
                                Bannir
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Posts Créés
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {stats.postsCount}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Likes Donnés
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {stats.likesGiven}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Likes Reçus
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-cyan-600 fill-current" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {stats.likesReceived}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enrolled Courses */}
            <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <BookOpen className="h-5 w-5" />
                        Formations Inscrites ({enrollments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {enrollments.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">
                            Aucune formation inscrite
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {enrollments.map((enrollment: any) => {
                                const isCompleted = enrollment.completed_at !== null
                                const progress = enrollment.progress || 0

                                return (
                                    <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-900">
                                                {enrollment.course?.title || 'Cours sans titre'}
                                            </h3>
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-sm text-slate-500 mb-1.5">
                                                    <span>Progression</span>
                                                    <span className="font-semibold">{progress}%</span>
                                                </div>
                                                <Progress
                                                    value={progress}
                                                    className="h-2"
                                                />
                                            </div>
                                            {isCompleted && (
                                                <p className="text-xs text-green-600 mt-2">
                                                    ✓ Terminé le {format(new Date(enrollment.completed_at), 'dd MMM yyyy', { locale: fr })}
                                                </p>
                                            )}
                                        </div>
                                        <Badge
                                            variant={isCompleted ? 'default' : 'secondary'}
                                            className={isCompleted ? 'bg-green-100 text-green-700 border-green-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}
                                        >
                                            {isCompleted ? 'Terminé' : 'En cours'}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
