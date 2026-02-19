import { getCourses } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Users, CheckCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminCoursesPage() {
    const courses = await getCourses()

    console.log('Courses fetched:', courses.length, courses)

    // Calculate stats
    const totalCourses = courses.length
    const publishedCourses = courses.filter((c: any) => c.is_published === true).length
    const totalStudents = courses.reduce((sum: number, c: any) => sum + (c.enrollments?.[0]?.count || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Gestion des Cours
                </h1>
                <p className="text-slate-500 mt-1">
                    Vue d'ensemble de tous les cours de la plateforme
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Cours
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {totalCourses}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Cours Publiés
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {publishedCourses}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Étudiants
                        </CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {totalStudents}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Courses Table */}
            <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Cours
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Créateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Étudiants
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {courses.map((course: any) => (
                                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {course.thumbnail_url ? (
                                                <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                    <Image
                                                        src={course.thumbnail_url}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-16 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                    <BookOpen className="h-6 w-6 text-indigo-600" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-900 truncate">
                                                    {course.title}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 border border-slate-200">
                                                <AvatarImage src={course.creator?.avatar_url || undefined} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-medium">
                                                    {course.creator?.name?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-slate-600">
                                                {course.creator?.name || 'Inconnu'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Users className="h-4 w-4" />
                                            <span className="font-medium">{course.enrollments?.[0]?.count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={course.is_published === true ? 'default' : 'secondary'}
                                            className={course.is_published === true
                                                ? 'bg-green-100 text-green-700 border-green-200 border'
                                                : 'bg-slate-100 text-slate-700 border-slate-200 border'
                                            }
                                        >
                                            {course.is_published === true ? 'Publié' : 'Brouillon'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {format(new Date(course.created_at), 'dd MMM yyyy', { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Voir le cours
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Summary */}
            <div className="text-sm text-slate-500">
                Total: {courses.length} cours
            </div>
        </div>
    )
}
