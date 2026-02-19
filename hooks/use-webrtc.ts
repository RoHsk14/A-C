import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface UserInfo {
    id: string
    name: string
    avatar_url?: string
    role?: string
}

export interface Peer {
    userId: string
    info?: UserInfo
    stream?: MediaStream
    isSpeaking: boolean
    isMuted: boolean
    reaction?: string
    message?: string
}

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
}

export function useWebRTC(roomId: string, user: UserInfo) {
    const [peers, setPeers] = useState<Peer[]>([])
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
    const [permissionError, setPermissionError] = useState<'permission-denied' | 'unsupported' | null>(null)
    const [kicked, setKicked] = useState(false)

    // Ephemeral state for local user
    const [localReaction, setLocalReaction] = useState<string | null>(null)

    const supabase = createClient()
    const channelRef = useRef<RealtimeChannel | null>(null)
    const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({})
    const localStreamRef = useRef<MediaStream | null>(null)
    const screenStreamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        if (kicked) return

        const init = async () => {
            try {
                // 1. Try to Get User Media (Audio mainly)
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                    setLocalStream(stream)
                    localStreamRef.current = stream
                } catch (err: any) {
                    console.warn("Microphone access failed, falling back to Listen Only mode:", err)
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setPermissionError('permission-denied')
                    } else {
                        setPermissionError('unsupported')
                    }
                }

                // 2. Join Supabase Channel with Rich Presence
                const channel = supabase.channel(`room:${roomId}`, {
                    config: {
                        presence: {
                            key: user.id,
                        },
                    },
                })

                channelRef.current = channel

                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel.presenceState()
                        const presentUserIds = Object.keys(state)
                        const otherUserIds = presentUserIds.filter(id => id !== user.id)

                        setPeers(prev => {
                            const newPeers = otherUserIds.map(id => {
                                const existing = prev.find(p => p.userId === id)
                                const presenceList = state[id] as any[]
                                const recentState = presenceList?.[presenceList.length - 1]

                                return {
                                    userId: id,
                                    info: recentState?.user || existing?.info,
                                    isMuted: recentState?.isMuted ?? existing?.isMuted ?? false,
                                    isSpeaking: existing?.isSpeaking ?? false,
                                    stream: existing?.stream,
                                    reaction: existing?.reaction, // Keep existing ephemeral state
                                    message: existing?.message
                                }
                            })
                            return newPeers
                        })
                    })
                    .on('presence', { event: 'leave' }, ({ key }) => {
                        if (peerConnections.current[key]) {
                            peerConnections.current[key].close()
                            delete peerConnections.current[key]
                        }
                        setPeers(prev => prev.filter(p => p.userId !== key))
                    })
                    .on('broadcast', { event: 'signal' }, async ({ payload }) => {
                        handleSignal(payload, channel)
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            await channel.track({
                                user,
                                isMuted: false,
                                online_at: new Date().toISOString()
                            })
                            setStatus('connected')
                            channel.send({
                                type: 'broadcast',
                                event: 'signal',
                                payload: { type: 'ready', from: user.id }
                            })
                        }
                    })

            } catch (err) {
                console.error('Error initializing WebRTC:', err)
                setStatus('error')
            }
        }

        init()

        return () => cleanup()
    }, [roomId, user.id, kicked])

    const cleanup = () => {
        localStreamRef.current?.getTracks().forEach(track => track.stop())
        screenStreamRef.current?.getTracks().forEach(track => track.stop())
        Object.values(peerConnections.current).forEach(pc => pc.close())
        if (channelRef.current) {
            channelRef.current.unsubscribe()
            supabase.removeChannel(channelRef.current)
        }
    }

    const handleSignal = async (payload: any, channel: RealtimeChannel) => {
        const { type, from, data, to, emoji, text } = payload
        if (from === user.id) return
        if (to && to !== user.id) return

        // --- Ephemeral Signals ---
        if (type === 'reaction') {
            setPeers(prev => prev.map(p => {
                if (p.userId === from) return { ...p, reaction: emoji }
                return p
            }))
            // Auto-clear reaction
            setTimeout(() => {
                setPeers(prev => prev.map(p => {
                    if (p.userId === from) return { ...p, reaction: undefined }
                    return p
                }))
            }, 3000)
            return
        }

        if (type === 'message') {
            setPeers(prev => prev.map(p => {
                if (p.userId === from) return { ...p, message: text }
                return p
            }))
            // Auto-clear message
            setTimeout(() => {
                setPeers(prev => prev.map(p => {
                    if (p.userId === from) return { ...p, message: undefined }
                    return p
                }))
            }, 6000) // 6 seconds for reading
            return
        }

        // --- Moderation ---
        if (type === 'force-mute') {
            if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach(track => track.enabled = false)
                setIsMuted(true)
                channel.track({ user, isMuted: true, online_at: new Date().toISOString() })
            }
            return
        }
        if (type === 'kick') {
            setKicked(true)
            cleanup()
            return
        }

        // --- WebRTC ---
        if (!peerConnections.current[from]) createPeerConnection(from)
        const pc = peerConnections.current[from]

        try {
            if (type === 'offer') {
                if (pc.signalingState !== 'stable') return
                await pc.setRemoteDescription(new RTCSessionDescription(data))
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'answer', from: user.id, to: from, data: answer } })
            } else if (type === 'answer') {
                if (pc.signalingState !== 'have-local-offer') return
                await pc.setRemoteDescription(new RTCSessionDescription(data))
            } else if (type === 'candidate') {
                if (data && pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(data))
            } else if (type === 'ready') {
                negotiate(from, pc)
            } else if (type === 'renegotiate') {
                // Triggered when a peer modified their tracks (e.g. added screen share)
                negotiate(from, pc)
            }
        } catch (e) {
            console.error(`Error handling signal ${type}:`, e)
        }
    }

    const createPeerConnection = (targetUserId: string) => {
        if (peerConnections.current[targetUserId]) return

        const pc = new RTCPeerConnection(STUN_SERVERS)

        // Add Local Tracks (Audio)
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!)
            })
        }

        // Add Screen Share Tracks (Global - added to all PCs)
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, screenStreamRef.current!)
            })
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                channelRef.current?.send({
                    type: 'broadcast', event: 'signal',
                    payload: { type: 'candidate', from: user.id, to: targetUserId, data: event.candidate }
                })
            }
        }

        pc.ontrack = (event) => {
            setPeers(prev => prev.map(p => {
                if (p.userId === targetUserId) {
                    return { ...p, stream: event.streams[0] }
                }
                return p
            }))
        }

        // Handle negotiation needed (triggers for every new track added dynamically)
        pc.onnegotiationneeded = () => {
            // We handle negotiation manually to avoid glare, but for screen sharing dynamic add
            // we might use a specific signal or just 'renegotiate'
        }

        peerConnections.current[targetUserId] = pc
    }

    const negotiate = async (targetId: string, pc: RTCPeerConnection) => {
        if (pc.signalingState !== 'stable') return
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        channelRef.current?.send({
            type: 'broadcast', event: 'signal',
            payload: { type: 'offer', from: user.id, to: targetId, data: offer }
        })
    }

    const toggleMute = async () => {
        if (localStreamRef.current) {
            const newMutedState = !isMuted
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !newMutedState)
            setIsMuted(newMutedState)
            await channelRef.current?.track({ user, isMuted: newMutedState, online_at: new Date().toISOString() })
        }
    }

    // --- Interactions --- //
    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            setScreenStream(stream)
            screenStreamRef.current = stream

            // Add tracks to all existing connections
            Object.values(peerConnections.current).forEach(pc => {
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream)
                })
            })

            // Broadcast 'renegotiate' to all peers so they expect a new offer (or just send offers)
            // Ideally we iterate and negotiate
            Object.entries(peerConnections.current).forEach(([targetId, pc]) => {
                negotiate(targetId, pc)
            })

            // Detect stop sharing (e.g. user clicks "Stop Sharing" in browser UI)
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare()
            }
        } catch (e) {
            console.error("Screen share failed", e)
        }
    }

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop())
            setScreenStream(null)
            screenStreamRef.current = null

            // Remove tracks from connections? 
            // WebRTC removal is tricky. Usually replacing or just renegotiating.
            // Simplified: we rely on track.onended handling in remote? 
            // Or we just tear down and rebuild? 
            // For now, simpler to just stop sending. 
            // A full implementation would remove senders.

            // Just refresh page for full cleanup is safest for mesh prototype
            // But let's try to notify.
        }
    }

    const sendReaction = (emoji: string) => {
        setLocalReaction(emoji)
        // Auto clear local
        setTimeout(() => setLocalReaction(null), 3000)

        channelRef.current?.send({
            type: 'broadcast', event: 'signal',
            payload: { type: 'reaction', from: user.id, emoji }
        })
    }

    const sendMessage = (text: string) => {
        channelRef.current?.send({
            type: 'broadcast', event: 'signal',
            payload: { type: 'message', from: user.id, text }
        })
    }

    // Admin Actions
    const muteUser = async (targetId: string) => {
        await channelRef.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'force-mute', from: user.id, to: targetId } })
    }
    const kickUser = async (targetId: string) => {
        await channelRef.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'kick', from: user.id, to: targetId } })
    }

    return {
        peers,
        localStream,
        screenStream,
        isMuted,
        toggleMute,
        startScreenShare,
        stopScreenShare,
        sendReaction,
        sendMessage,
        localReaction,
        status,
        permissionError,
        kicked,
        muteUser,
        kickUser
    }
}
