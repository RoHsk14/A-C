'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createInvitation, revokeInvitation } from '@/app/(dashboard)/creator/communities/actions'
import { toast } from 'sonner'
import { Loader2, Trash2, Copy, Plus, Link as LinkIcon, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

interface Invitation {
    id: string
    token: string
    role: string
    created_at: string
    accepted_at: string | null
    email: string | null
}

interface CommunityInvitationsProps {
    communityId: string
    invitations: Invitation[]
}

export function CommunityInvitations({ communityId, invitations }: CommunityInvitationsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [revokingId, setRevokingId] = useState<string | null>(null)

    // Form State
    const [inviteType, setInviteType] = useState('link')
    const [email, setEmail] = useState('')

    const handleCreate = async () => {
        setLoading(true)
        try {
            // If email type, validate email
            const targetEmail = inviteType === 'email' ? email : undefined
            if (inviteType === 'email' && !targetEmail) {
                toast.error("Veuillez saisir une adresse email")
                setLoading(false)
                return
            }

            await createInvitation(communityId, 'member', targetEmail)

            toast.success(inviteType === 'email' ? "Invitation envoyée par email !" : "Lien d'invitation généré !")

            // Reset form
            setEmail('')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la création")
        } finally {
            setLoading(false)
        }
    }

    const handleRevoke = async (id: string) => {
        setRevokingId(id)
        try {
            await revokeInvitation(id, communityId)
            toast.success("Invitation révoquée.")
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la révocation")
        } finally {
            setRevokingId(null)
        }
    }

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/invite/${token}`
        navigator.clipboard.writeText(url)
        toast.success("Lien copié !")
    }

    const activeInvitations = invitations.filter(i => !i.accepted_at)

    return (
        <div className="space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
                <Tabs defaultValue="link" value={inviteType} onValueChange={setInviteType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="link">Lien Public</TabsTrigger>
                        <TabsTrigger value="email">Par Email</TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4">
                        <div className="text-sm text-zinc-500">
                            Génère un lien unique qui peut être partagé. Attention, ce lien est à usage unique (une fois accepté, il expire).
                        </div>
                    </TabsContent>

                    <TabsContent value="email" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse Email du membre</Label>
                            <Input
                                id="email"
                                placeholder="exemple@domaine.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p className="text-xs text-zinc-500">
                                Seul l'utilisateur avec cette adresse email pourra accepter l'invitation.
                            </p>
                        </div>
                    </TabsContent>

                    <Button onClick={handleCreate} disabled={loading} className="w-full sm:w-auto mt-4">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        {inviteType === 'link' ? 'Générer le lien' : 'Envoyer l\'invitation'}
                    </Button>
                </Tabs>
            </div>

            <div className="space-y-4">
                <h3 className="font-medium text-lg">Invitations en attente</h3>
                <div className="space-y-3">
                    {activeInvitations.map((invite) => (
                        <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 gap-4">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`p-2 rounded-full ${invite.email ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                                    {invite.email ? <Mail className="h-5 w-5" /> : <LinkIcon className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {invite.email ? (
                                            <span className="font-medium text-sm">{invite.email}</span>
                                        ) : (
                                            <span className="font-mono text-xs text-zinc-500 truncate max-w-[150px]">
                                                .../invite/{invite.token.substring(0, 8)}...
                                            </span>
                                        )}
                                        <Badge variant="outline" className="text-xs capitalize">{invite.role}</Badge>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Créé le {new Date(invite.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button variant="ghost" size="sm" onClick={() => copyLink(invite.token)} className="text-xs h-8">
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copier lien
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                    onClick={() => handleRevoke(invite.id)}
                                    disabled={revokingId === invite.id}
                                >
                                    {revokingId === invite.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {activeInvitations.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
                            Aucune invitation en attente.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
