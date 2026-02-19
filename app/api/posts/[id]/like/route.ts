import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: postId } = await params

        // Vérifier l'authentification
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Vérifier si l'utilisateur a déjà liké
        const { data: existingLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single()

        if (existingLike) {
            // Unlike: supprimer le like
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id)

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                )
            }

            return NextResponse.json({ liked: false })
        } else {
            // Like: créer un nouveau like
            const { error } = await supabase
                .from('likes')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                })

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                )
            }

            return NextResponse.json({ liked: true })
        }
    } catch (error) {
        console.error('Error toggling like:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
