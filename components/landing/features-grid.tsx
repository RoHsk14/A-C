import { BookOpen, MessageCircle, Calendar } from 'lucide-react'

const features = [
    {
        title: "Cours & Formations",
        description: "Une expérience d'apprentissage fluide et moderne. Hébergez vos vidéos, ressources et quiz.",
        icon: BookOpen,
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
        title: "Discussions Privées",
        description: "Remplacez les groupes WhatsApp par des flux organisés, pérennes et sans distractions.",
        icon: MessageCircle,
        color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
        title: "Événements & Lives",
        description: "Gérez vos rencontres virtuelles et physiques directement depuis votre espace.",
        icon: Calendar,
        color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
]

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 md:py-32 bg-zinc-50 dark:bg-zinc-950/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Le Hub de votre Univers</h2>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400">
                        Tout ce dont vous avez besoin pour animer une communauté, sans jongler entre 10 outils différents.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{feature.title}</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
