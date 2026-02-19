import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function CourseLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Vérifier que le cours existe
    const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!course) {
        notFound()
    }

    return <>{children}</>
}
