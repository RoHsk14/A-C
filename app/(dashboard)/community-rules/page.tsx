import React from 'react'

export default function CommunityRulesPage() {
    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Règles de la Communauté</h1>

            <div className="prose dark:prose-invert">
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                    Bienvenue dans notre espace d'apprentissage et de partage. Pour garantir une expérience positive pour tous, nous vous demandons de respecter ces quelques règles simples.
                </p>

                <div className="space-y-6">
                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-3 text-indigo-600">1. Respect et Bienveillance</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Traitez tous les membres avec respect. Les insultes, le harcèlement et les propos discriminatoires ne sont pas tolérés.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-3 text-indigo-600">2. Contenu Approprié</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Partagez du contenu pertinent et utile. Évitez le spam, la publicité non sollicitée et le contenu offensant.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-3 text-indigo-600">3. Propriété Intellectuelle</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Respectez les droits d'auteur. Ne partagez que du contenu dont vous avez les droits ou l'autorisation.
                        </p>
                    </section>
                </div>

                <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm">
                    <p>
                        Le non-respect de ces règles peut entraîner la modération de vos publications voire la suspension de votre compte.
                    </p>
                </div>
            </div>
        </div>
    )
}
