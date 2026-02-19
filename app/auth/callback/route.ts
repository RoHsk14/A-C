import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/utils'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'
    const baseUrl = getBaseUrl()

    console.log("Callback triggered with code:", code ? "YES" : "NO", "next:", next)

    try {
        if (code) {
            const supabase = await createClient()
            try {
                const { error } = await supabase.auth.exchangeCodeForSession(code)

                if (error) {
                    console.error("Exchange code error:", error)
                    return NextResponse.redirect(`${baseUrl}/login?error=exchange_code_failed`)
                }

                console.log("Session exchanged successfully")

                // Check if profile has email
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError || !user) {
                    console.error("Get user error:", userError)
                    return NextResponse.redirect(`${baseUrl}/login?error=get_user_failed`)
                }

                console.log("User found:", user.id)

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', user.id)
                    .single()

                if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows found"
                    console.error("Get profile error:", profileError)
                    // Continue anyway, don't block login for profile fetch error
                }

                if (!profile?.email) {
                    console.log("Profile missing email, user email:", user.email)
                    // Update profile with auth email if missing (fallback sync)
                    if (user.email) {
                        const { error: updateError } = await supabase.from('profiles').update({ email: user.email }).eq('id', user.id)
                        if (updateError) {
                            console.error("Update profile email error:", updateError)
                        } else {
                            console.log("Profile email synced")
                        }
                    } else {
                        console.log("Redirecting to onboarding (missing email)")
                        return NextResponse.redirect(`${baseUrl}/onboarding?missing_email=true`)
                    }
                }

                console.log("Redirecting to next:", next)
                return NextResponse.redirect(`${baseUrl}${next}`)

            } catch (err) {
                console.error("Callback unexpected error:", err)
                return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
            }
        }
    } catch (criticalErr: any) {
        console.error("CRITICAL INIT ERROR:", criticalErr)
        return NextResponse.redirect(`${baseUrl}/login?error=init_error&details=${encodeURIComponent(criticalErr.message || 'Unknown')}`)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${baseUrl}/login?error=auth_code_error`)
}
