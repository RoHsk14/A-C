import { BarChart3, MessageSquare, Users } from 'lucide-react'

export function CommunityHubPreview() {
    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Le Hub Communautaire</h2>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400">
                        Plus qu'un cours, un véritable réseau social privé pour vos membres.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Poll Card */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 text-indigo-600 font-medium">
                            <BarChart3 className="w-5 h-5" />
                            <span>Sondages & Votes</span>
                        </div>
                        <h3 className="font-bold mb-4">Prochain sujet de Live ?</h3>
                        <div className="space-y-3">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 bottom-0 bg-indigo-200 dark:bg-indigo-800/40 w-[70%]" />
                                <div className="relative flex justify-between text-sm px-2">
                                    <span>E-commerce</span>
                                    <span className="font-bold">70%</span>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg relative">
                                <div className="flex justify-between text-sm px-2">
                                    <span>Crypto</span>
                                    <span className="font-bold">30%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thread Card */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 text-emerald-600 font-medium">
                            <MessageSquare className="w-5 h-5" />
                            <span>Fils de Discussion</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-200" />
                                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none text-sm">
                                    Quelqu'un a déjà testé le module 3 ? C'est incroyable !
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 p-3 rounded-2xl rounded-tr-none text-sm border border-emerald-100 dark:border-emerald-800">
                                    Oui ! La partie sur le marketing est top. 🔥
                                </div>
                                <div className="w-8 h-8 rounded-full bg-emerald-200" />
                            </div>
                        </div>
                    </div>

                    {/* Directory Card */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 text-purple-600 font-medium">
                            <Users className="w-5 h-5" />
                            <span>Annuaire Membres</span>
                        </div>
                        <div className="flex -space-x-3 overflow-hidden py-4 justify-center">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                                    M{i}
                                </div>
                            ))}
                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-400">
                                +1k
                            </div>
                        </div>
                        <p className="text-center text-sm text-zinc-500 mt-2">Connectez-vous avec des passionnés.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
