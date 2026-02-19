import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PostCard } from '@/components/post-card'
import { Settings, BookOpen, MessageSquare, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Récupérer le profil complet
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return <div>Profil introuvable</div>
    }

    // Récupérer les posts de l'utilisateur
    const { data: posts } = await supabase
        .from('posts')
        .select(`
      id,
      content,
      images,
      created_at,
      author:profiles!posts_author_id_fkey(name, avatar_url),
      likes:likes(count),
      comments:comments(count)
    `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    // Récupérer les cours suivis (via enrollments)
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
      course:courses(id, title, thumbnail_url, description, price_xof)
    `)
        .eq('user_id', user.id)

    const formattedPosts = (posts || []).map((post: any) => ({
        ...post,
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        user_has_liked: false, // TODO
    }))

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Hero Header */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Info Card - Overlapping Hero */}
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative -mt-16 md:-mt-20">
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-100 overflow-hidden shadow-lg relative">
                                    {profile.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl font-bold">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info & Actions */}
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {profile.name}
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto md:mx-0">
                                    {profile.bio || "Pas encore de bio. Les entrepreneurs mystérieux sont souvent les plus intéressants."}
                                </p>

                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-zinc-500 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Membre depuis {format(new Date(profile.created_at), 'MMMM yyyy', { locale: fr })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="flex-shrink-0">
                                <Button variant="outline" className="gap-2">
                                    <Settings className="w-4 h-4" />
                                    Modifier
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="posts" className="space-y-6">
                    <TabsList className="w-full justify-start h-auto p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto">
                        <TabsTrigger
                            value="posts"
                            className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Mes Posts
                            <span className="ml-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs">
                                {posts?.length || 0}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="courses"
                            className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Mes Formations
                            <span className="ml-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs">
                                {enrollments?.length || 0}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2">
                        {formattedPosts.length > 0 ? (
                            formattedPosts.map((post: any) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <Card className="border-dashed bg-zinc-50 dark:bg-zinc-900/50">
                                <CardContent className="py-12 text-center text-zinc-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Aucune publication pour le moment.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="courses" className="animate-in fade-in-50 slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enrollments && enrollments.length > 0 ? (
                                enrollments.map(({ course }: any) => (
                                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800">
                                            {course.thumbnail_url ? (
                                                <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                    <BookOpen className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-lg line-clamp-1 mb-2">{course.title}</h3>
                                            <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{course.description}</p>
                                            <Button className="w-full" variant="secondary" asChild>
                                                <a href={`/courses/${course.slug || '#'}`}>Continuer</a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="col-span-full border-dashed bg-zinc-50 dark:bg-zinc-900/50">
                                    <CardContent className="py-12 text-center text-zinc-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>Vous n'êtes inscrit à aucune formation.</p>
                                        <Button variant="link" asChild className="mt-2">
                                            <a href="/courses">Explorer le catalogue</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
