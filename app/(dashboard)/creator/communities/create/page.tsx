import { CreateCommunityForm } from '@/components/admin/create-community-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function CreateCommunityPage() {
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div>
                <Link href="/creator/communities">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Retour aux communautés
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Créer une communauté
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Lancez un nouvel espace global pour rassembler vos membres et organiser vos discussions par thèmes (espaces).
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <CreateCommunityForm />
            </div>
        </div>
    )
}
