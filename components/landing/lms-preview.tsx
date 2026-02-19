import { Play, FileText, Download, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LMSPreview() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-black overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">L'Expérience Apprenant</h2>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400">
                        Transformez votre savoir en une expérience premium. Un lecteur vidéo immersif, des ressources téléchargeables, et une progression claire.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Mockup Container */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[500px]">

                        {/* Video Player Area (Left/Top) */}
                        <div className="flex-1 bg-black relative group">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all cursor-pointer">
                                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                                </div>
                            </div>

                            {/* Video Controls Mockup */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="h-1 bg-white/30 rounded-full mb-4 overflow-hidden cursor-pointer">
                                    <div className="h-full w-1/3 bg-indigo-500 rounded-full relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-white text-sm font-medium">
                                    <div>12:45 / 45:00</div>
                                    <div>HD</div>
                                </div>
                            </div>
                        </div>

                        {/* Course Sidebar (Right/Bottom) */}
                        <div className="w-full md:w-96 border-l border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
                                <h3 className="font-bold text-lg mb-1">Module 3: Le Business Model</h3>
                                <div className="text-sm text-zinc-500 flex items-center gap-2">
                                    <span className="text-indigo-600 font-medium">35% complété</span>
                                    <div className="h-1.5 w-24 bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full w-[35%] bg-indigo-600 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200 decoration-zinc-400">Chapitre {i}: Les fondations</div>
                                            <div className="text-xs text-zinc-500">15 min • Vidéo</div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Chapitre 4: La stratégie de prix</div>
                                        <div className="text-xs text-indigo-600 dark:text-indigo-400">En cours...</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                                <h4 className="text-xs font-semibold uppercase text-zinc-400 mb-3">Ressources</h4>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full justify-start text-zinc-600 dark:text-zinc-300">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Workbook.pdf
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start text-zinc-600 dark:text-zinc-300">
                                        <Download className="w-4 h-4 mr-2" />
                                        Audio MP3
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
