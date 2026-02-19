import { Plus } from 'lucide-react'

export function MultiSpacePreview() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Gérez tout votre empire.<br />Depuis un seul compte.</h2>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-8">
                        Vous avez plusieurs business ? Plusieurs communautés ?
                        Passez de l'un à l'autre en un clic grâce à notre architecture multi-espaces.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">F</div>
                            <div>
                                <div className="font-bold">Formation E-Commerce</div>
                                <div className="text-xs text-zinc-500">1,200 membres</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm opacity-70">
                            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">C</div>
                            <div>
                                <div className="font-bold">Club Investisseurs</div>
                                <div className="text-xs text-zinc-500">450 membres</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed opacity-50">
                            <div className="w-10 h-10 rounded-lg border-2 border-zinc-300 flex items-center justify-center text-zinc-400">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div className="font-medium text-zinc-400">Créer une nouvelle communauté</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    {/* Visual representation of Sidebar Switcher */}
                    <div className="w-20 bg-zinc-900 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl skew-y-6 rotate-6 transform hover:rotate-0 hover:skew-y-0 transition-all duration-500 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/50 flex items-center justify-center text-white font-bold text-xl border-2 border-white/20">F</div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 opacity-60 flex items-center justify-center text-white font-bold text-xl">C</div>
                        <div className="w-12 h-12 rounded-xl bg-purple-600 opacity-60 flex items-center justify-center text-white font-bold text-xl">T</div>
                        <div className="w-8 h-1 bg-zinc-800 rounded-full mx-auto my-2" />
                        <div className="w-12 h-12 rounded-xl border-2 border-zinc-700 border-dashed flex items-center justify-center text-zinc-600">
                            <Plus className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
