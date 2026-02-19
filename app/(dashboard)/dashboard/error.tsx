'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="p-8 m-4 bg-red-50 border-2 border-red-500 rounded-xl">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Une erreur est survenue !</h2>
            <p className="font-mono text-red-700 bg-red-100 p-4 rounded mb-4">
                {error.message || "Erreur inconnue"}
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Réessayer
            </button>
        </div>
    )
}
