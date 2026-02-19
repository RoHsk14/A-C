import { Check, X } from 'lucide-react'

export function ComparisonTable() {
    return (
        <section className="py-24 bg-zinc-900 text-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Le Chaos vs La Clarté</h2>
                    <p className="text-xl text-zinc-400">
                        Pourquoi continuer à bricoler quand vous pouvez professionnaliser ?
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* The Chaos */}
                    <div className="p-8 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-red-400">
                            <X className="w-6 h-6" />
                            Le Chaos Actuel
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4 opacity-70">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <div className="font-bold">Groupes WhatsApp bruyants</div>
                                    <div className="text-sm text-zinc-400">Notifications incessantes, messages perdus.</div>
                                </div>
                            </li>
                            <li className="flex gap-4 opacity-70">
                                <span className="text-2xl">📂</span>
                                <div>
                                    <div className="font-bold">Google Drive désorganisé</div>
                                    <div className="text-sm text-zinc-400">Liens expirés, fichiers introuvables.</div>
                                </div>
                            </li>
                            <li className="flex gap-4 opacity-70">
                                <span className="text-2xl">💸</span>
                                <div>
                                    <div className="font-bold">Paiements manuels</div>
                                    <div className="text-sm text-zinc-400">Vérification de captures d'écran fastidieuse.</div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* The Clarity */}
                    <div className="p-8 rounded-3xl bg-indigo-900/20 border border-indigo-500/30 relative overflow-hidden transform md:scale-105 shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-indigo-400">
                            <Check className="w-6 h-6" />
                            La Clarté Afro-Circle
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">Discussions Organisées</div>
                                    <div className="text-sm text-zinc-400">Fils de discussion par thématique.</div>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">Tout Centralisé</div>
                                    <div className="text-sm text-zinc-400">Cours, membres et événements au même endroit.</div>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">Automatisé à 100%</div>
                                    <div className="text-sm text-zinc-400">De l'encaissement à l'accès membre.</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
