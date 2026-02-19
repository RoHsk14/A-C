/**
 * Types TypeScript générés depuis le schéma Supabase
 * Pour régénérer : npx supabase gen types typescript --project-id "your-project-ref" > lib/types/database.types.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    name: string
                    bio: string | null
                    phone: string | null
                    avatar_url: string | null
                    role: 'user' | 'admin'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    bio?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    bio?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            spaces: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    is_private: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    is_private?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    description?: string | null
                    is_private?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            space_members: {
                Row: {
                    id: string
                    space_id: string
                    user_id: string
                    role: 'admin' | 'moderator' | 'member'
                    joined_at: string
                }
                Insert: {
                    id?: string
                    space_id: string
                    user_id: string
                    role?: 'admin' | 'moderator' | 'member'
                    joined_at?: string
                }
                Update: {
                    id?: string
                    space_id?: string
                    user_id?: string
                    role?: 'admin' | 'moderator' | 'member'
                    joined_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    space_id: string
                    author_id: string
                    content: string
                    images: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    space_id: string
                    author_id: string
                    content: string
                    images?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    space_id?: string
                    author_id?: string
                    content?: string
                    images?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            courses: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    thumbnail_url: string | null
                    price_xof: number
                    price_usd: number
                    instructor_id: string
                    is_published: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    description?: string | null
                    thumbnail_url?: string | null
                    price_xof?: number
                    price_usd?: number
                    instructor_id: string
                    is_published?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    description?: string | null
                    thumbnail_url?: string | null
                    price_xof?: number
                    price_usd?: number
                    instructor_id?: string
                    is_published?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    course_id: string
                    title: string
                    description: string | null
                    video_url: string | null
                    content: string | null
                    order_index: number
                    duration_seconds: number | null
                    is_preview: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    course_id: string
                    title: string
                    description?: string | null
                    video_url?: string | null
                    content?: string | null
                    order_index?: number
                    duration_seconds?: number | null
                    is_preview?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string
                    title?: string
                    description?: string | null
                    video_url?: string | null
                    content?: string | null
                    order_index?: number
                    duration_seconds?: number | null
                    is_preview?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            enrollments: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    status: 'pending' | 'active' | 'expired' | 'cancelled'
                    payment_provider: string | null
                    payment_reference: string | null
                    enrolled_at: string
                    expires_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    course_id: string
                    status?: 'pending' | 'active' | 'expired' | 'cancelled'
                    payment_provider?: string | null
                    payment_reference?: string | null
                    enrolled_at?: string
                    expires_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    course_id?: string
                    status?: 'pending' | 'active' | 'expired' | 'cancelled'
                    payment_provider?: string | null
                    payment_reference?: string | null
                    enrolled_at?: string
                    expires_at?: string | null
                }
            }
            completed_lessons: {
                Row: {
                    id: string
                    user_id: string
                    lesson_id: string
                    completed_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    lesson_id: string
                    completed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    lesson_id?: string
                    completed_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
