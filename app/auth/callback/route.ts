import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/utils'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'
    const baseUrl = getBaseUrl()

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if profile has email
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', user.id)
                    .single()

                if (!profile?.email) {
                    // Update profile with auth email if missing (fallback sync)
                    if (user.email) {
                        await supabase.from('profiles').update({ email: user.email }).eq('id', user.id)
                    } else {
                        return NextResponse.redirect(`${baseUrl}/onboarding?missing_email=true`)
                    }
                }
            }

            return NextResponse.redirect(`${baseUrl}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${baseUrl}/login?error=auth_code_error`)
}
