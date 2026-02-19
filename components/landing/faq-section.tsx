import { ShieldCheck, CreditCard, Lock } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FaqSection() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Questions Fréquentes</h2>
                        <p className="text-zinc-500 mb-8">
                            Tout ce que vous devez savoir avant de lancer votre empire.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                <ShieldCheck className="text-green-500" />
                                <span className="text-sm font-medium">Données Sécurisées</span>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                <CreditCard className="text-indigo-500" />
                                <span className="text-sm font-medium">Paiements Locaux</span>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                <Lock className="text-amber-500" />
                                <span className="text-sm font-medium">Connexion SSL</span>
                            </div>
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Est-ce que je possède mes données ?</AccordionTrigger>
                            <AccordionContent>
                                Absolument. Contrairement aux réseaux sociaux, vous êtes propriétaire de votre liste d'emails et de vos contenus. Vous pouvez tout exporter quand vous voulez.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Quels moyens de paiement sont acceptés ?</AccordionTrigger>
                            <AccordionContent>
                                Nous intégrons nativement Wave, Orange Money, MTN Mobile Money, ainsi que les cartes bancaires internationales (Visa/Mastercard).
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Puis-je utiliser mon propre nom de domaine ?</AccordionTrigger>
                            <AccordionContent>
                                Oui ! Avec le plan Pro, vous pouvez connecter votre propre domaine (ex: cours.mon-site.com) pour une expérience 100% marque blanche.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Y a-t-il des frais cachés ?</AccordionTrigger>
                            <AccordionContent>
                                Non. Notre tarification est transparente. Nous prenons une petite commission uniquement si vous réalisez des ventes, ou vous pouvez opter pour un abonnement fixe sans commission.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            {/* Real Footer */}
            <div className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
                <div className="flex justify-center gap-6 mb-8">
                    <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">À propos</a>
                    <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Tarifs</a>
                    <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Mentions Légales</a>
                    <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Contact</a>
                </div>
                <p>&copy; {new Date().getFullYear()} Afro-Circle. Fait avec ❤️ en Afrique.</p>
            </div>
        </section>
    )
}
