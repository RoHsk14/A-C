import { redirect } from 'next/navigation'

export default function InvitationsRedirectPage({ params }: { params: { slug: string } }) {
    redirect(`/creator/communities/${params.slug}/settings?tab=invitations`)
}
