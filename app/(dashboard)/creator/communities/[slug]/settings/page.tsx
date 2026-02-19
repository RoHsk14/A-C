import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CommunitySettingsForm } from '@/components/admin/community-settings-form'
import { CommunityMembersList } from '@/components/admin/community-members-list'
import { CommunityInvitations } from '@/components/admin/community-invitations'
import { getInvitations } from '@/app/(dashboard)/creator/communities/actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Settings, Users, Link as LinkIcon } from 'lucide-react'
import { BrandingForm } from '@/components/creator/branding-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CommunitySettingsPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { slug } = await params

    // 1. Fetch Community & Verify Access
    const { data: community } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!community) notFound()

    // Check if user is creator or admin
    // For update/delete settings, usually restrict to creator/admin
    const { data: membership } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', community.id)
        .eq('user_id', user.id)
        .single()

    const isCreator = community.creator_id === user.id
    const isAdmin = membership?.role === 'admin'

    if (!isCreator && !isAdmin) {
        redirect(`/creator/communities/${slug}`)
    }

    // 2. Fetch Members (for Members tab)
    const { data: rawMembers, error: membersError } = await supabase
        .from('community_members')
        .select(`
            id,
            user_id,
            role,
            joined_at,
            profile:profiles(name, email, avatar_url)
        `)
        .eq('community_id', community.id)
        .order('joined_at', { ascending: false })

    if (membersError) {
        console.error("Error fetching members:", membersError)
    }
    console.log("Raw Members Data:", JSON.stringify(rawMembers, null, 2))

    // Safe cast for profile which is a single relation query
    const members = rawMembers?.map((m: any) => ({
        ...m,
        profile: Array.isArray(m.profile) ? m.profile[0] : m.profile
    })) || []

    // 3. Fetch Invitations
    const invitations = await getInvitations(community.id)

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/creator/communities/${slug}`}>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Paramètres
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Gérez votre communauté {community.name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={`/c/${slug}`} target="_blank">
                            <LinkIcon className="w-4 h-4" />
                            Voir la page publique
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="members">Membres</TabsTrigger>
                    <TabsTrigger value="invitations">Invitations</TabsTrigger>
                    <TabsTrigger value="branding">Apparence</TabsTrigger>
                </TabsList>

                {/* GENERAL SETTINGS */}
                <TabsContent value="general" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations Générales</CardTitle>
                            <CardDescription>
                                Modifiez les détails de votre communauté visible par les membres.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CommunitySettingsForm community={community} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MEMBERS MANAGEMENT */}
                <TabsContent value="members" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Membres</CardTitle>
                            <CardDescription>
                                Gérez les accès et rôles des membres de votre communauté.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CommunityMembersList
                                communityId={community.id}
                                members={members || []}
                                currentUserId={user.id}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INVITATIONS */}
                <TabsContent value="invitations" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invitations</CardTitle>
                            <CardDescription>
                                Invitez de nouvelles personnes à rejoindre votre communauté.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CommunityInvitations
                                communityId={community.id}
                                invitations={invitations}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BRANDING */}
                <TabsContent value="branding" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apparence & Branding</CardTitle>
                            <CardDescription>
                                Personnalisez le logo, les couleurs et l'identité visuelle de votre communauté.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BrandingForm
                                communityId={community.id}
                                initialData={{
                                    logo_url: community.logo_url,
                                    primary_color: community.primary_color,
                                    favicon_url: community.favicon_url
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    )
}
