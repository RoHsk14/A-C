import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-40 right-20 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-70" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 animate-fade-in-up">
                    <Sparkles className="w-4 h-4" />
                    <span>La plateforme communautaire nouvelle génération</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 max-w-5xl mx-auto leading-tight">
                    Réunissez vos cours, vos membres et vos discussions <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">en un seul lieu.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                    La plateforme tout-en-un pour les créateurs africains qui veulent bâtir un empire durable.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Link href="/register">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105">
                            Commencer l'aventure
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white">
                            Découvrir les fonctionnalités
                        </Button>
                    </Link>
                </div>

                {/* Mockup / Glassmorphism Visual */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="relative rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] group">
                        {/* Mockup Header */}
                        <div className="absolute top-0 left-0 right-0 h-12 border-b border-zinc-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center px-4 gap-2 z-20">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                            </div>
                            <div className="mx-auto text-xs font-medium text-zinc-400">afro-circle.com</div>
                        </div>

                        {/* Mockup Content - Realistic Dashboard Representation */}
                        <div className="absolute inset-0 pt-12 bg-zinc-50 dark:bg-black/95 flex text-xs md:text-sm overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-16 md:w-56 border-r border-zinc-200/50 dark:border-zinc-800/50 p-3 hidden md:flex flex-col gap-4 bg-white/50 dark:bg-zinc-900/50">
                                <div className="h-8 w-8 md:w-24 bg-indigo-600/10 rounded-lg flex items-center gap-2 px-2 text-indigo-600 font-bold">
                                    <div className="w-4 h-4 rounded bg-indigo-600"></div>
                                    <span className="hidden md:block">AfroCircle</span>
                                </div>
                                <div className="space-y-1 pt-4">
                                    <div className="h-8 w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md flex items-center px-3 gap-3 font-medium">
                                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                                        <span>Tableau de bord</span>
                                    </div>
                                    <div className="h-8 w-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md flex items-center px-3 gap-3">
                                        <div className="w-4 h-4 rounded border-2 border-zinc-300" />
                                        <span>Membres</span>
                                    </div>
                                    <div className="h-8 w-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md flex items-center px-3 gap-3">
                                        <div className="w-4 h-4 rounded border-2 border-zinc-300" />
                                        <span>Formations</span>
                                    </div>
                                    <div className="h-8 w-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md flex items-center px-3 gap-3">
                                        <div className="w-4 h-4 rounded border-2 border-zinc-300" />
                                        <span>Revenus</span>
                                    </div>
                                </div>
                                <div className="mt-auto p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full mb-2 overflow-hidden">
                                        <div className="h-full w-2/3 bg-indigo-500 rounded-full" />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-zinc-500">
                                        <span>Stockage</span>
                                        <span>65%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 md:p-8 overflow-hidden bg-zinc-50 dark:bg-black">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Vue d'ensemble</h3>
                                        <p className="text-zinc-500 text-xs">Bienvenue, Créateur 👋</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                            <div className="w-4 h-4 rounded-full border border-zinc-400" />
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800" />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                                        <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">Membres Actifs</div>
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">1,240</div>
                                        <div className="text-green-500 text-[10px] flex items-center gap-1 mt-1">
                                            <span>↑ 12%</span> depuis hier
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                                        <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">Revenus (Mois)</div>
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">4.5M CFA</div>
                                        <div className="text-green-500 text-[10px] flex items-center gap-1 mt-1">
                                            <span>↑ 8%</span> vs mois dernier
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                                        <div className="text-zinc-500 text-[10px] uppercase font-semibold mb-1">Taux d'engagement</div>
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">85%</div>
                                        <div className="text-zinc-400 text-[10px] flex items-center gap-1 mt-1">
                                            Stable
                                        </div>
                                    </div>
                                </div>

                                {/* Chart / Activity */}
                                <div className="h-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="font-semibold text-zinc-900 dark:text-white">Activité de la communauté</div>
                                        <div className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">7 derniers jours</div>
                                    </div>
                                    <div className="flex items-end gap-2 h-32 mt-8 px-2">
                                        {[40, 65, 35, 50, 75, 60, 85, 95, 70, 60, 75, 55].map((h, i) => (
                                            <div key={i} className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-t-sm relative group">
                                                <div
                                                    className="absolute bottom-0 left-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-1000 group-hover:bg-indigo-400"
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overlay Gradient for "Reflection" */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Decorative Elements behind mockup */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-2xl -z-10 rotate-12 backdrop-blur-sm border border-indigo-500/20" />
                    <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-violet-500/10 rounded-full -z-10 backdrop-blur-sm border border-violet-500/20" />
                </div>
            </div>
        </section>
    )
}
