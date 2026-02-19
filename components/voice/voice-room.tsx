'use client'

import { useEffect, useState } from 'react'
import { useWebRTC } from '@/hooks/use-webrtc'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, PhoneOff, Users, MoreVertical, ShieldAlert, LogOut, X, UserPlus, Crown, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from '@/components/ui/separator'

interface VoiceRoomProps {
    spaceId: string
    spaceName: string
    isOwner?: boolean
}

export function VoiceRoom({ spaceId, spaceName, isOwner = false }: VoiceRoomProps) {
    const [user, setUser] = useState<any>(null)
    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch profile for rich presence
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('name, avatar_url, role')
                    .eq('id', user.id)
                    .single()

                setUser({
                    id: user.id,
                    name: profile?.name || user.email?.split('@')[0] || 'Anonyme',
                    avatar_url: profile?.avatar_url,
                    role: isOwner ? 'owner' : (profile?.role || 'member')
                })
            }
            setLoading(false)
        }
        getUser()
    }, [isOwner])

    if (loading) return <div className="p-8 text-center animate-pulse">Chargement du profil...</div>
    if (!user) return <div className="p-8 text-center text-red-500">Erreur : Vous devez être connecté.</div>

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Salon Vocal : {spaceName}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Rejoignez la discussion audio. Assurez-vous d'utiliser un casque pour une meilleure expérience et éviter l'écho.
                    </p>
                </div>

                <Card className="p-6 flex flex-col items-center gap-4 bg-muted/50 border-dashed">
                    <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">{user.role}</div>
                    </div>
                </Card>

                <Button size="lg" onClick={() => setJoined(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105">
                    <Mic className="w-5 h-5" />
                    Rejoindre le salon
                </Button>
            </div>
        )
    }

    return <ActiveRoom spaceId={spaceId} user={user} isOwner={isOwner} />
}

function ActiveRoom({ spaceId, user, isOwner }: { spaceId: string, user: any, isOwner: boolean }) {
    const {
        peers, localStream, screenStream, isMuted, toggleMute,
        startScreenShare, stopScreenShare, sendReaction, sendMessage, localReaction,
        status, permissionError, kicked, muteUser, kickUser
    } = useWebRTC(spaceId, user)

    const isAdmin = user.role === 'admin' || user.role === 'moderator' || user.role === 'owner' || isOwner
    const [showAdminPanel, setShowAdminPanel] = useState(isAdmin)
    const [messageInput, setMessageInput] = useState('')
    const [showReactions, setShowReactions] = useState(false)

    // Ensure audio/video elements
    useEffect(() => {
        peers.forEach(peer => {
            if (peer.stream) {
                // Check if video
                const isVideo = peer.stream.getVideoTracks().length > 0
                const mediaElement = document.getElementById(`media-${peer.userId}`) as HTMLMediaElement
                if (mediaElement && mediaElement.srcObject !== peer.stream) {
                    mediaElement.srcObject = peer.stream
                    mediaElement.play().catch(e => console.error("Error playing media:", e))
                }
            }
        })
    }, [peers])

    if (kicked) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
                    <LogOut className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Vous avez été exclu du salon</h2>
                <Button onClick={() => window.location.reload()} variant="outline">Retour au tableau de bord</Button>
            </div>
        )
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (messageInput.trim()) {
            sendMessage(messageInput.trim())
            setMessageInput('')
        }
    }

    // Determine layout: Grid or Featured (if screen share exists)
    const screenSharingPeer = peers.find(p => p.stream?.getVideoTracks().length && p.stream.getVideoTracks().length > 0)
    const activeScreenStream = screenStream || screenSharingPeer?.stream
    const isSpotlightMode = !!activeScreenStream

    return (
        <div className="flex h-[calc(100dvh-8rem)] lg:h-[calc(100vh-8rem)] gap-4 relative">
            {/* Animations Styles */}
            <style jsx global>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
                    80% { transform: translateY(-80px) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
                }
                .reaction-float {
                    animation: floatUp 2s ease-out forwards;
                }
            `}</style>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${status === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`} />
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {status === 'connected' ? 'Connecté au salon' : 'Connexion en cours...'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAdminPanel(!showAdminPanel)} className={showAdminPanel ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                            <Users className="w-4 h-4 mr-2" />
                            <span className="text-sm">{peers.length + 1}</span>
                        </Button>
                    </div>
                </div>

                {/* SPOTLIGHT VIEW (When Screen Sharing) */}
                {isSpotlightMode ? (
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden pb-24 lg:pb-0">
                        {/* Main Screen Share Area */}
                        <div className="flex-[3] bg-black/5 rounded-xl border-2 border-indigo-500/20 relative overflow-hidden flex items-center justify-center p-2 group">
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium z-10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {screenStream ? 'Votre partage' : `Partage de ${screenSharingPeer?.info?.name || 'Utilisateur'}`}
                            </div>

                            <video
                                ref={(ref) => {
                                    if (ref && activeScreenStream && ref.srcObject !== activeScreenStream) {
                                        ref.srcObject = activeScreenStream
                                    }
                                }}
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                            />
                        </div>

                        {/* Participants Strip */}
                        <div className="flex-1 overflow-x-auto p-2">
                            <div className="flex gap-4 min-w-max h-full items-center">
                                {/* Self (Mini) */}
                                <Card className={`w-48 h-full flex flex-col items-center justify-center gap-2 relative border-2 ${isMuted ? 'border-zinc-200 dark:border-zinc-800' : 'border-emerald-500/50'} bg-emerald-500/5 shrink-0 overflow-hidden`}>
                                    {/* ... Self Avatar/Info ... */}
                                    <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-center w-full px-2 z-10">
                                        <div className="font-bold text-xs truncate">{user.name} (Vous)</div>
                                    </div>
                                    {isMuted && <MicOff className="absolute top-2 right-2 w-4 h-4 text-red-500 z-10" />}

                                    {localReaction && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl reaction-float z-50 pointer-events-none">{localReaction}</div>}
                                </Card>

                                {/* Peers (Mini) */}
                                {peers.map(peer => {
                                    // If peer.stream IS the screen share, we might not have their webcam.
                                    // But normally we just try to play.

                                    return (
                                        <Card key={peer.userId} className="w-48 h-full flex flex-col items-center justify-center gap-2 relative shrink-0 overflow-hidden">
                                            <Avatar className={`w-12 h-12 border-2 ${peer.isSpeaking ? 'border-emerald-500' : 'border-background'}`}>
                                                <AvatarImage src={peer.info?.avatar_url} />
                                                <AvatarFallback>{peer.info?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="text-center w-full px-2 z-10">
                                                <div className="font-bold text-xs truncate">{peer.info?.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{peer.info?.role}</div>
                                            </div>

                                            {peer.isMuted && <MicOff className="absolute top-2 right-2 w-4 h-4 text-muted-foreground z-10" />}

                                            {/* Reaction with Animation */}
                                            {peer.reaction && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl reaction-float z-50 pointer-events-none">{peer.reaction}</div>}

                                            {/* Message inside card to avoid clipping */}
                                            {peer.message && (
                                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 px-3 py-1 rounded-xl shadow-lg text-xs whitespace-nowrap z-50 border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-bottom-2 max-w-[90%] truncate">
                                                    {peer.message}
                                                </div>
                                            )}

                                            {/* Audio for peer */}
                                            {/* We rely on the global audio effect or individual elements.
                                                If we put <audio> here, it might duplicate if we are not careful.
                                                But React reconciliation should handle it if ID matches.
                                            */}
                                            <audio id={`audio-mini-${peer.userId}`} autoPlay playsInline ref={ref => {
                                                if (ref && peer.stream && ref.srcObject !== peer.stream) {
                                                    // Only set if this stream has AUDIO.
                                                    // If it's a known screen share stream WITHOUT audio, we might skip.
                                                    // But normally we just try to play.
                                                    ref.srcObject = peer.stream
                                                }
                                            }} className="hidden" />
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* GRID LAYOUT (Standard) */
                    <div className="flex-1 overflow-y-auto p-1 pb-32 lg:pb-1">
                        <div className={`grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>

                            {/* SELF CARD */}
                            <Card className={`p-6 flex flex-col items-center justify-center gap-4 relative border-2 border-emerald-500/20 bg-emerald-500/5 transition-all aspect-square overflow-hidden`}>
                                <>
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-center z-10">
                                        <div className="font-bold text-lg truncate w-full px-2 flex items-center justify-center gap-2">
                                            {user.name} (Vous)
                                            {user.role === 'owner' && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                        </div>
                                        <div className={`text-sm font-medium ${isOwner ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {user.role === 'owner' ? 'Propriétaire' : (permissionError ? 'Écoute seule' : (isMuted ? 'Micro coupé' : 'En train de parler'))}
                                        </div>
                                    </div>
                                </>

                                {/* Local Reaction */}
                                {localReaction && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl reaction-float z-50 pointer-events-none">
                                        {localReaction}
                                    </div>
                                )}

                                {(isMuted || permissionError) && (
                                    <div className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full shadow-sm z-10">
                                        <MicOff className="w-5 h-5" />
                                    </div>
                                )}
                            </Card>

                            {/* PEERS CARDS */}
                            {peers.map(peer => {
                                const isSharingScreen = peer.stream?.getVideoTracks().length && peer.stream.getVideoTracks().length > 0
                                return (
                                    <Card key={peer.userId} className={`p-6 flex flex-col items-center justify-center gap-4 relative group transition-all overflow-hidden ${isSharingScreen ? 'col-span-2 md:col-span-3 lg:col-span-4 aspect-video bg-black' : 'aspect-square'}`}>

                                        {isSharingScreen ? (
                                            <video id={`media-${peer.userId}`} autoPlay playsInline className="w-full h-full object-contain rounded-lg" />
                                        ) : (
                                            <>
                                                <Avatar className={`w-24 h-24 border-4 transition-all ${peer.isSpeaking ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-background shadow-sm'}`}>
                                                    <AvatarImage src={peer.info?.avatar_url} />
                                                    <AvatarFallback className="text-2xl">
                                                        {peer.info?.name ? peer.info.name.substring(0, 2).toUpperCase() : peer.userId.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="text-center w-full z-10">
                                                    <div className="font-bold text-lg truncate w-full px-2">
                                                        {peer.info?.name || 'Utilisateur'}
                                                    </div>
                                                    <div className="text-sm font-medium flex items-center justify-center gap-1">
                                                        {peer.info?.role === 'owner' && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                                        <span className={peer.info?.role === 'owner' ? 'text-amber-600 dark:text-amber-400' : peer.info?.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}>
                                                            {peer.info?.role === 'owner' ? 'Propriétaire' : peer.info?.role === 'admin' ? 'Admin' : 'Invité'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Audio Element (Hidden if not screen sharing, but needed for audio) */}
                                                <audio id={`media-${peer.userId}`} autoPlay playsInline className="hidden" />
                                            </>
                                        )}

                                        {/* Reaction Display with Animation */}
                                        {peer.reaction && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl reaction-float z-50 pointer-events-none">
                                                {peer.reaction}
                                            </div>
                                        )}

                                        {peer.message && (
                                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-2xl shadow-xl text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 z-50 max-w-[200px] truncate border border-zinc-200 dark:border-zinc-700">
                                                {peer.message}
                                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-800 rotate-45 border-b border-r border-zinc-200 dark:border-zinc-700"></div>
                                            </div>
                                        )}

                                        {peer.isMuted && !isSharingScreen && (
                                            <div className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full z-10">
                                                <MicOff className="w-5 h-5" />
                                            </div>
                                        )}

                                        {isAdmin && !isSharingScreen && (
                                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        <DropdownMenuLabel>Modération</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => muteUser(peer.userId)} className="text-amber-600 focus:text-amber-700">
                                                            <MicOff className="w-4 h-4 mr-2" />
                                                            Couper le micro
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => kickUser(peer.userId)} className="text-destructive focus:text-destructive">
                                                            <LogOut className="w-4 h-4 mr-2" />
                                                            Exclure
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Control Bar (Moved up on mobile to clear bottom nav) */}
                {/* Control Bar (Moved up on mobile to clear bottom nav) */}
                <div className="absolute bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-2 lg:pr-6 rounded-full shadow-2xl flex items-center gap-2 lg:gap-4 z-50 transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar">
                    {/* Floating Message Input - Hidden on mobile to save space */}
                    <form onSubmit={handleSendMessage} className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 mr-4">
                        <input
                            type="text"
                            placeholder="Message rapide..."
                            className="bg-transparent border-none outline-none text-white placeholder-white/50 px-3 w-32 focus:w-64 transition-all text-sm"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <button type="submit" className="hidden" />
                    </form>

                    {/* Reactions Trigger */}
                    <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 lg:h-10 lg:w-10">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="center" className="flex gap-2 p-2 bg-white/90 backdrop-blur-xl border-none shadow-2xl rounded-full mb-4">
                            {['❤️', '👏', '🔥', '😂', '😮'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => { sendReaction(emoji); setShowReactions(false) }}
                                    className="text-2xl hover:scale-125 transition-transform p-2"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mute Toggle */}
                    <Button
                        variant={isMuted ? "destructive" : "secondary"}
                        size="icon"
                        className={`h-12 w-12 lg:h-14 lg:w-14 rounded-full transition-all ${isMuted ? 'shadow-red-500/20 shadow-lg' : 'shadow-zinc-500/10'}`}
                        onClick={toggleMute}
                        disabled={!!permissionError}
                    >
                        {isMuted ? <MicOff className="w-5 h-5 lg:w-6 lg:h-6" /> : <Mic className="w-5 h-5 lg:w-6 lg:h-6" />}
                    </Button>

                    {/* Screen Share */}
                    <Button
                        variant={screenStream ? "destructive" : "secondary"}
                        size="icon"
                        className={`rounded-full h-10 w-10 lg:h-10 lg:w-10 ${screenStream ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                        onClick={screenStream ? stopScreenShare : startScreenShare}
                    >
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                        </div>
                    </Button>

                    <div className="h-8 w-px bg-zinc-700 mx-2 hidden lg:block" />

                    {/* Leave */}
                    <Button
                        variant="destructive"
                        className="h-10 rounded-full px-4 gap-2 font-medium bg-red-600 hover:bg-red-700"
                        onClick={() => window.location.reload()}
                    >
                        <PhoneOff className="w-4 h-4" />
                        <span className="hidden lg:inline">Quitter</span>
                    </Button>
                </div>
            </div>

            {/* Side Panel (Admin & List) */}
            {showAdminPanel && (
                <Card className="w-80 flex flex-col h-full border-l rounded-none lg:rounded-xl overflow-hidden bg-background shadow-lg z-40 animate-in slide-in-from-right-4">
                    <div className="p-4 border-b flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" /> Participants ({peers.length + 1})
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAdminPanel(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {/* Me */}
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            {user.name} <span className="text-xs text-muted-foreground">(Vous)</span>
                                            {user.role === 'owner' && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                        </span>
                                        <span className={`text-xs capitalize ${user.role === 'owner' ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                            {user.role === 'owner' ? 'Propriétaire' : user.role}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    {isMuted && <MicOff className="w-4 h-4 text-destructive" />}
                                </div>
                            </div>

                            <Separator />

                            {/* Peers */}
                            {peers.map(peer => (
                                <div key={peer.userId} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={peer.info?.avatar_url} />
                                            <AvatarFallback>{peer.info?.name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium truncate max-w-[120px] flex items-center gap-1">
                                                {peer.info?.name || "Invité"}
                                                {peer.info?.role === 'owner' && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                            </span>
                                            <span className={`text-xs capitalize ${peer.info?.role === 'owner' ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                                {peer.info?.role === 'owner' ? 'Propriétaire' : (peer.info?.role || "invité")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {peer.isMuted && <MicOff className="w-4 h-4 text-muted-foreground mr-1" />}

                                        {isAdmin && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => muteUser(peer.userId)} className="text-amber-600">
                                                        <MicOff className="w-4 h-4 mr-2" />
                                                        Couper le micro
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => kickUser(peer.userId)} className="text-destructive">
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Exclure
                                                    </DropdownMenuItem>
                                                    {/* Placeholder for promote */}
                                                    {/* <DropdownMenuItem className="text-blue-600">
                                                        <Crown className="w-4 h-4 mr-2" />
                                                        Promouvoir
                                                    </DropdownMenuItem> */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="p-4 border-t bg-muted/20">
                            <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                                <ShieldAlert className="w-3 h-3" /> Espace Modération
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    )
}
