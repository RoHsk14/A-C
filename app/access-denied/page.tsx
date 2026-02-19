import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function AccessDeniedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Accès Refusé</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full">
                            Retour au Tableau de Bord
                        </Button>
                    </Link>
                    <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full">
                            Se déconnecter
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
