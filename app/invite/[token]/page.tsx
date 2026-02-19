import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Hash, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AcceptInviteButton } from '@/components/accept-invite-button'

export default async function InvitePage({ params }: { params: { token: string } }) {
    const token = params.token
    const supabase = await createClient()

    // 1. Check User Auth
    const { data: { user } } = await supabase.auth.getUser()

    // If not logged in, redirect to login with return url
    if (!user) {
        redirect(`/login?redirect=/invite/${token}`)
    }

    // 2. Fetch Invitation Details via RPC (Bypassing RLS safely)
    const { data: inviteData, error } = await supabase.rpc('get_invitation_by_token', { lookup_token: token })

    // RPC returns an array (table), we expect one result
    const inviteRecord = inviteData && inviteData.length > 0 ? inviteData[0] : null

    // Transform flat structure back to nested object for compatibility
    const invite = inviteRecord ? {
        id: inviteRecord.id,
        community_id: inviteRecord.community_id,
        email: inviteRecord.email,
        token: inviteRecord.token,
        role: inviteRecord.role,
        expires_at: inviteRecord.expires_at,
        accepted_at: inviteRecord.accepted_at,
        community: {
            id: inviteRecord.community_id,
            name: inviteRecord.community_name,
            description: inviteRecord.community_description,
            slug: inviteRecord.community_slug
        }
    } : null

    // 3. Handle Invalid/Expired
    if (error || !invite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <Card className="max-w-md w-full border-red-200 dark:border-red-900">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-red-700 dark:text-red-400">Invitation Invalide</CardTitle>
                        <CardDescription>
                            Ce lien d'invitation n'existe pas ou a été supprimé.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Retour à l'accueil</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (new Date(invite.expires_at) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-zinc-500" />
                        </div>
                        <CardTitle>Invitation Expirée</CardTitle>
                        <CardDescription>
                            Ce lien d'invitation a expiré. Demandez-en un nouveau à l'administrateur.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Retour à l'accueil</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="max-w-md w-full shadow-lg">
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl" />
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <Hash className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <CardTitle className="text-2xl">Rejoindre {invite.community.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                        {invite.community.description || "Vous avez été invité à rejoindre cette communauté."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                            You
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                {user.user_metadata?.name || user.email}
                            </p>
                            <p className="text-zinc-500">Connecté en tant que</p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex-col gap-3 pb-8">
                    <AcceptInviteButton token={token} />
                    <Button asChild variant="ghost" className="w-full">
                        <Link href="/dashboard">Annuler</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
