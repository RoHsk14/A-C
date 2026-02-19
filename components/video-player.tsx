'use client'

import MuxPlayer from '@mux/mux-player-react'
import { Card, CardContent } from '@/components/ui/card'
import { Video } from 'lucide-react'

interface VideoPlayerProps {
    videoId: string | null
    title: string
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
    if (!videoId) {
        return (
            <Card className="aspect-video flex items-center justify-center bg-gray-50 mb-6 border-zinc-200">
                <CardContent className="text-center">
                    <Video className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucune vidéo disponible</p>
                </CardContent>
            </Card>
        )
    }

    const cleanId = videoId.trim()
    const lowerId = cleanId.toLowerCase()

    // 1. YouTube Detection
    const isYoutube = cleanId.length === 11 || lowerId.includes('youtube') || lowerId.includes('youtu.be')

    if (isYoutube) {
        let youtubeId = cleanId
        try {
            if (lowerId.includes('v=')) {
                youtubeId = cleanId.split('v=')[1].split('&')[0]
            } else if (lowerId.includes('youtu.be/')) {
                youtubeId = cleanId.split('youtu.be/')[1].split('?')[0]
            }
        } catch (e) {
            console.error("Error extracting youtube ID", e)
        }

        return (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative shadow-lg">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        )
    }

    // 2. Mux Detection & Direct Files
    let muxPlaybackId = cleanId
    const isUrl = cleanId.startsWith('http')

    if (isUrl) {
        if (cleanId.includes('stream.mux.com')) {
            const match = cleanId.match(/\/([^/]+)\.m3u8/)
            muxPlaybackId = match ? match[1] : cleanId
        } else if (cleanId.match(/\.(mp4|mov|webm)$/i)) {
            // 3. Direct File (HTML5 Video)
            return (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative shadow-lg">
                    <video
                        className="w-full h-full"
                        controls
                        playsInline
                        preload="metadata"
                        src={cleanId}
                    >
                        Votre navigateur ne supporte pas la lecture de cette vidéo.
                    </video>
                </div>
            )
        } else {
            // URL non reconnue
            return (
                <Card className="aspect-video flex items-center justify-center bg-gray-50 mb-6 border-zinc-200">
                    <CardContent className="text-center">
                        <Video className="h-10 w-10 text-amber-300 mx-auto mb-2" />
                        <p className="text-muted-foreground">Format vidéo non supporté</p>
                    </CardContent>
                </Card>
            )
        }
    }

    // Render Mux
    return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
            <MuxPlayer
                playbackId={muxPlaybackId}
                metadata={{
                    video_title: title,
                }}
                streamType="on-demand"
                className="w-full h-full"
                primaryColor="#FFFFFF"
                secondaryColor="#000000"
            />
        </div>
    )
}
