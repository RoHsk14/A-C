import { ArrowRight, CreditCard, Mail, Unlock } from 'lucide-react'

export function AutomationFlow() {
    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Automatisation & Flux de Travail</h2>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400">
                        Gagnez du temps. Automatisez votre business de A à Z. Fini la gestion manuelle des accès WhatsApp.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10 -translate-y-1/2" />

                        {/* Step 1: Payment */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-zinc-800 shadow-xl flex items-center justify-center z-10 mx-auto transition-transform group-hover:scale-110 group-hover:border-indigo-500">
                                <CreditCard className="w-10 h-10 text-indigo-600" />
                            </div>
                            <div className="text-center mt-6 bg-white dark:bg-black px-2">
                                <h3 className="font-bold text-lg mb-1">Paiement Reçu</h3>
                                <p className="text-sm text-zinc-500">Wave, OM, Carte</p>
                            </div>
                        </div>

                        {/* Arrow 1 */}
                        <div className="md:hidden">
                            <ArrowRight className="w-6 h-6 text-zinc-300" />
                        </div>

                        {/* Step 2: Invite */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-zinc-800 shadow-xl flex items-center justify-center z-10 mx-auto transition-transform group-hover:scale-110 group-hover:border-indigo-500 delay-100">
                                <Mail className="w-10 h-10 text-purple-600" />
                            </div>
                            <div className="text-center mt-6 bg-white dark:bg-black px-2">
                                <h3 className="font-bold text-lg mb-1">Invitation Envoyée</h3>
                                <p className="text-sm text-zinc-500">Email automatique</p>
                            </div>
                        </div>

                        {/* Arrow 2 */}
                        <div className="md:hidden">
                            <ArrowRight className="w-6 h-6 text-zinc-300" />
                        </div>

                        {/* Step 3: Access */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-zinc-800 shadow-xl flex items-center justify-center z-10 mx-auto transition-transform group-hover:scale-110 group-hover:border-indigo-500 delay-200">
                                <Unlock className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="text-center mt-6 bg-white dark:bg-black px-2">
                                <h3 className="font-bold text-lg mb-1">Accès Débloqué</h3>
                                <p className="text-sm text-zinc-500">Communauté & Cours</p>
                            </div>
                        </div>
                    </div>

                    {/* Automation Tag */}
                    <div className="mt-16 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium border border-green-100 dark:border-green-900">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Zéro intervention humaine requise
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
