'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createInvitation } from '@/app/(dashboard)/creator/communities/actions'

interface InviteMemberModalProps {
    communityId: string
    trigger?: React.ReactNode
}


export function InviteMemberModal({ communityId, trigger }: InviteMemberModalProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('member')
    const [loading, setLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCreateInvite = async () => {
        setLoading(true)
        try {
            // Updated to use communityId and new createInvitation signature (which takes role as 2nd arg usually, checking signature)
            // Signature from actions.ts: createInvitation(communityId: string, role: string = 'member')
            // Wait, does it take email?
            // Checking Step 1231: createInvitation(communityId, role) -> No email param!
            // So email field is useless for now unless I update action or ignore it.
            // Action returns { token, ... }

            const result = await createInvitation(communityId, role)

            // Construct full URL
            const url = `${window.location.origin}/invite/${result.token}`
            setInviteLink(url)
            toast.success("Lien d'invitation créé !")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la création de l'invitation")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!inviteLink) return
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success("Lien copié !")
        setTimeout(() => setCopied(false), 2000)
    }

    const reset = () => {
        setInviteLink(null)
        setEmail('')
        setRole('member')
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setTimeout(reset, 300)
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="brand">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Inviter un membre
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Inviter un membre</DialogTitle>
                    <DialogDescription>
                        Créez un lien d'invitation unique pour rejoindre la communauté.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <div className="space-y-4 py-4">
                        {/* Email field removed/hidden if not used by action, or kept as dummy? 
                            Action doesn't use email. Let's remove it to avoid confusion or keep it if I plan to add email support.
                            For now, action only generates token.
                        */}
                        {/* To strictly follow action: remove email input or clarify it does nothing? 
                            I'll remove it to be clean.
                        */}

                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Membre</SelectItem>
                                    <SelectItem value="moderator">Modérateur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 break-all text-sm font-mono text-zinc-600 dark:text-zinc-400">
                            {inviteLink}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copié !" : "Copier le lien"}
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    {!inviteLink && (
                        <Button onClick={handleCreateInvite} disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Générer le lien
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
