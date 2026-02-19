'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const colors = [
    { name: 'Indigo', value: '#4F46E5', class: 'bg-indigo-600' },
    { name: 'Rouge', value: '#E11D48', class: 'bg-rose-600' },
    { name: 'Vert', value: '#10B981', class: 'bg-emerald-500' },
    { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
    { name: 'Noir', value: '#18181B', class: 'bg-zinc-900' },
]

export function BrandingShowcase() {
    const [selectedColor, setSelectedColor] = useState(colors[0])

    return (
        <section className="py-24 md:py-32 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Votre marque.<br />
                            Vos couleurs.<br />
                            <span className="text-zinc-400">Pas les nôtres.</span>
                        </h2>
                        <p className="text-xl text-zinc-500 mb-10 max-w-lg mx-auto lg:mx-0">
                            Afro-Circle s'efface pour laisser briller votre identité. Personnalisez votre espace pour qu'il soit une extension naturelle de votre marque.
                        </p>

                        {/* Interactive Color Picker */}
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            {colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-offset-2 ${selectedColor.name === color.name ? 'ring-black dark:ring-white scale-110' : 'ring-transparent'}`}
                                    aria-label={`Select ${color.name}`}
                                >
                                    {selectedColor.name === color.name && <Check className="w-5 h-5 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Visual/Mockup */}
                    <div className="flex-1 w-full max-w-lg">
                        <div className="relative rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl rotate-3 transition-colors duration-500" style={{ borderColor: `${selectedColor.value}30` }}>
                            {/* Mock Header */}
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-colors duration-300 shadow-lg" style={{ backgroundColor: selectedColor.value }}>
                                        AC
                                    </div>
                                    <div className="font-bold text-lg dark:text-white">Ma Communauté</div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>

                            {/* Mock Body */}
                            <div className="space-y-6">
                                <div className="h-40 rounded-xl bg-zinc-200 dark:bg-zinc-800 w-full animate-pulse" />
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold dark:text-white">Bienvenue dans le cercle</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Rejoignez nos discussions exclusives et accédez à nos formations premium.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full text-white font-medium shadow-xl transition-all duration-300 hover:opacity-90 active:scale-95"
                                    style={{ backgroundColor: selectedColor.value, boxShadow: `0 10px 30px -10px ${selectedColor.value}70` }}
                                >
                                    Rejoindre maintenant
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
