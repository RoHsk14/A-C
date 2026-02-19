import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // 1. Récupérer l'utilisateur (Rafraîchit le token si nécessaire)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 2. Protection des routes (Redirection pour non-connectés)
    const protectedPrefixes = ['/dashboard', '/admin', '/creator', '/profile', '/my-courses']
    const isProtected = protectedPrefixes.some(prefix => path.startsWith(prefix))

    if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
    }

    // 3. Redirection pour connectés (Login/Register)
    if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // 4. Protection par RÔLE (RBAC)
    if (user && (path.startsWith('/admin') || path.startsWith('/creator'))) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'user'

        // Protection /admin
        if (path.startsWith('/admin') && role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/access-denied'
            return NextResponse.redirect(url)
        }

        // Protection /creator
        // Accessible aux creators ET aux admins
        if (path.startsWith('/creator') && !['creator', 'admin'].includes(role)) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match toutes les routes sauf :
         * - _next/static (fichiers statiques)
         * - _next/image (optimisation d'images)
         * - favicon.ico (favicon)
         * - fichiers publics (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
