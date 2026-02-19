import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: false, // Helps with WebRTC in dev
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'image.mux.com',
            },
        ],
    },
}

export default nextConfig
