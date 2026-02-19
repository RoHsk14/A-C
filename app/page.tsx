import { Hero } from '@/components/landing/hero'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { BrandingShowcase } from '@/components/landing/branding-showcase'
import { Benefits } from '@/components/landing/benefits'
import { CtaBanner } from '@/components/landing/cta-banner'
import { LMSPreview } from '@/components/landing/lms-preview'
import { AutomationFlow } from '@/components/landing/automation-flow'
import { ComparisonTable } from '@/components/landing/comparison-table'
import { MultiSpacePreview } from '@/components/landing/multi-space-preview'
import { CommunityHubPreview } from '@/components/landing/community-hub-preview'
import { FaqSection } from '@/components/landing/faq-section'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black selection:bg-indigo-500/30">
            <Hero />
            <FeaturesGrid />
            <CommunityHubPreview />
            <LMSPreview />
            <AutomationFlow />
            <ComparisonTable />
            <MultiSpacePreview />
            <BrandingShowcase />
            <Benefits />
            <CtaBanner />
            <FaqSection />

            {/* Simple Footer */}
            <footer className="py-12 border-t border-zinc-100 dark:border-zinc-800 text-center text-sm text-zinc-500">
                <p>&copy; {new Date().getFullYear()} Afro-Circle. Tous droits réservés.</p>
            </footer>
        </main>
    )
}
