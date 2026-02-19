'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateCommunityBranding } from '@/app/(dashboard)/creator/communities/actions'
import { toast } from 'sonner'
import { Upload, Palette, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BrandingFormProps {
    communityId: string
    initialData: {
        logo_url?: string | null
        primary_color?: string | null
        favicon_url?: string | null
    }
}

export function BrandingForm({ communityId, initialData }: BrandingFormProps) {
    const [loading, setLoading] = useState(false)
    const [primaryColor, setPrimaryColor] = useState(initialData.primary_color || '#4F46E5')
    const [logoUrl, setLogoUrl] = useState(initialData.logo_url || '')
    const [faviconUrl, setFaviconUrl] = useState(initialData.favicon_url || '')

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setLoading(true)
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${type}-${Date.now()}.${fileExt}`
            const filePath = `communities/${communityId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('public_assets') // Assuming a bucket exists, or create one?
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('public_assets')
                .getPublicUrl(filePath)

            if (type === 'logo') setLogoUrl(publicUrl)
            else setFaviconUrl(publicUrl)

            toast.success(`Image téléversée avec succès`)
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors du téléversement")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateCommunityBranding(communityId, {
                logo_url: logoUrl,
                primary_color: primaryColor,
                favicon_url: faviconUrl
            })
            toast.success("Branding mis à jour !")
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800">

            {/* Logo Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-lg">Logo & Identité</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Logo de la communauté</Label>
                        <div className="flex items-center gap-4">
                            {logoUrl ? (
                                <div className="h-20 w-20 relative rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleUpload(e, 'logo')}
                                    disabled={loading}
                                />
                                <p className="text-xs text-zinc-500 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Favicon (Icône d'onglet)</Label>
                        <div className="flex items-center gap-4">
                            {faviconUrl ? (
                                <div className="h-10 w-10 relative rounded border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                                    <img src={faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain" />
                                </div>
                            ) : (
                                <div className="h-10 w-10 rounded border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400">
                                    <div className="w-4 h-4 bg-zinc-300 rounded-full" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/x-icon,image/png"
                                    onChange={(e) => handleUpload(e, 'favicon')}
                                    disabled={loading}
                                />
                                <p className="text-xs text-zinc-500 mt-1">Carre, 32x32px recommandé</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 mt-6">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-lg">Couleurs</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Label>Couleur Principale</Label>
                        <div className="flex gap-4 items-center">
                            <div
                                className="w-16 h-16 rounded-lg shadow-sm border border-zinc-200"
                                style={{ backgroundColor: primaryColor }}
                            />
                            <div className="space-y-2 flex-1">
                                <Input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-10 w-full cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="font-mono uppercase"
                                    placeholder="#000000"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Cette couleur sera utilisée pour les boutons, liens et accents importants.
                        </p>
                    </div>

                    {/* Preview */}
                    {/* Preview */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <Label className="text-xs uppercase tracking-wider text-zinc-500">Aperçu en direct</Label>
                        </div>
                        <div className="bg-white dark:bg-black p-0">
                            {/* Mock Navbar */}
                            <div className="h-16 border-b border-zinc-100 dark:border-zinc-900 flex items-center px-6">
                                <div className="flex items-center gap-3">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: primaryColor }}>
                                            AC
                                        </div>
                                    )}
                                    <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                                        Nom Communauté
                                    </span>
                                </div>
                            </div>

                            {/* Mock Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex gap-3">
                                    <Button style={{ backgroundColor: primaryColor }}>
                                        Bouton Principal
                                    </Button>
                                    <Button variant="outline" style={{ color: primaryColor, borderColor: primaryColor }}>
                                        Secondaire
                                    </Button>
                                </div>
                                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <h4 className="font-medium mb-1">Contenu avec accent</h4>
                                    <p className="text-sm text-zinc-500">
                                        Voici un exemple de lien <span style={{ color: primaryColor }} className="font-medium underline cursor-pointer">actif</span> dans le texte.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <Button type="submit" disabled={loading} size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer les modifications
                </Button>
            </div>
        </form>
    )
}
