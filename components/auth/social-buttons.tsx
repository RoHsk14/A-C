"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { toast } from "sonner"

export function SocialButtons() {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const supabase = createClient()


    const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
        try {
            setIsLoading(provider)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) throw error
        } catch (error: any) {
            console.error("Auth error details:", {
                message: error.message,
                status: error.status,
                name: error.name,
                fullError: error
            })
            toast.error(error.message || "Erreur lors de la connexion avec " + provider)
            setIsLoading(null)
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Google - Primary */}
            <Button
                variant="outline"
                type="button"
                className="w-full h-12 rounded-2xl bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900 font-medium shadow-sm relative overflow-hidden group"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading !== null}
            >
                {isLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continuer avec Google
                    </>
                )}
            </Button>

            {/* 
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    type="button"
                    className="flex-1 h-12 rounded-2xl bg-black hover:bg-zinc-800 text-white border-none shadow-sm"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={isLoading !== null}
                >
                    {isLoading === 'apple' ? (
                        <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.65-.95 1.86.11 3.08.92 3.81 1.96-1.57.81-1.81 3.31-.08 4.75-.41 1.37-1.12 3-1.88 4.09-.44.75-1.12 1.51-1.58 2.38zm-1.88-14.7c.39-1.99 2.18-3.39 4.19-3.26-.26 2.22-2.18 3.96-4.19 3.26z" />
                        </svg>
                    )}
                    Apple
                </Button>

                <Button
                    variant="outline"
                    type="button"
                    className="flex-1 h-12 rounded-2xl bg-[#1877F2] hover:bg-[#1864cc] text-white border-none shadow-sm"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading !== null}
                >
                    {isLoading === 'facebook' ? (
                        <div className="w-5 h-5 border-2 border-blue-300 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 2.898v1.073h3.409l-.173 3.667h-3.236v7.98h3.328a6.326 6.326 0 0 0 4.137-1.947 5.961 5.961 0 0 0 1.545-4.129 6.223 6.223 0 0 0-1.848-4.526 6.44 6.44 0 0 0-4.706-2.028 6.435 6.435 0 0 0-4.524 1.85 5.94 5.94 0 0 0-1.848 4.232c0 1.745.69 3.32 1.812 4.475a6.05 6.05 0 0 0 4.463 1.82 6.095 6.095 0 0 0 3.824-1.28l1.41 2.275a8.875 8.875 0 0 1-5.693 2.035c-2.583 0-4.965-.995-6.804-2.658a9.42 9.42 0 0 1-2.906-6.942 9.418 9.418 0 0 1 2.91-7.07 9.475 9.475 0 0 1 6.808-2.906c2.486 0 4.885.996 6.772 2.673a8.913 8.913 0 0 1 2.918 6.845 8.955 8.955 0 0 1-2.28 6.035 8.769 8.769 0 0 1-6.104 2.804z" />
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    )}
                    Facebook
                </Button>
            </div>
            */}

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-black px-2 text-zinc-500">ou avec email</span>
                </div>
            </div>
        </div>
    )
}
