import { redirect } from 'next/navigation'

export default async function InvitationsRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    redirect(`/creator/communities/${slug}/settings?tab=invitations`)
}
