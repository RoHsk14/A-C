import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CtaBanner() {
    return (
        <section className="py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="bg-zinc-900 dark:bg-white rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white dark:text-zinc-900">
                            Prêt à lancer votre cercle ?
                        </h2>
                        <p className="text-xl text-zinc-400 dark:text-zinc-600">
                            Rejoignez les créateurs qui bâtissent l'avenir de l'économie numérique en Afrique.
                        </p>
                        <div className="pt-4">
                            <Link href="/register">
                                <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 shadow-2xl transition-transform hover:scale-105">
                                    Commencez gratuitement
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
