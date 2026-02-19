import { Zap, Wallet, Lock } from 'lucide-react'

const benefits = [
    {
        title: "Paiements Locaux",
        description: "Intégration native des solutions que vos clients utilisent déjà : Mobile Money, Wave, Orange Money.",
        icon: Wallet,
    },
    {
        title: "Vitesse Fulgurante",
        description: "Optimisé pour les connexions mobiles africaines. Charger rapidement, même en 3G.",
        icon: Zap,
    },
    {
        title: "Propriété Totale",
        description: "Vous possédez vos données et vos membres. Ne dépendez plus des algorithmes des réseaux sociaux.",
        icon: Lock,
    },
]

export function Benefits() {
    return (
        <section className="py-24 bg-indigo-950 text-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-16">Pourquoi Afro-Circle ?</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {benefits.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-900/50 border border-indigo-800 flex items-center justify-center text-indigo-300 mb-2">
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold">{item.title}</h3>
                            <p className="text-indigo-200/80 leading-relaxed max-w-xs">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
