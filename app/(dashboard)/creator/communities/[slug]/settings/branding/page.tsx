import { createClient } from '@/lib/supabase/server'
import { BrandingForm } from '@/components/creator/branding-form'
import { notFound } from 'next/navigation'

export default async function CommunityBrandingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch community by slug
    const { data: community } = await supabase
        .from('communities')
        .select('id, name, logo_url, primary_color, favicon_url')
        .eq('slug', slug)
        .single()

    if (!community) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Apparence de {community.name}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Personnalisez le logo, les couleurs et l'identité visuelle de votre communauté.
                </p>
            </div>

            <BrandingForm
                communityId={community.id}
                initialData={{
                    logo_url: community.logo_url,
                    primary_color: community.primary_color,
                    favicon_url: community.favicon_url
                }}
            />
        </div>
    )
}
