-- =====================================================
-- CRÉATION DES ESPACES DE DISCUSSION
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour remplir votre liste d'espaces.

INSERT INTO spaces (name, slug, description, is_private) VALUES
('🌍 Général', 'general', 'Discussions générales et annonces', false),
('📦 E-commerce & Dropshipping', 'e-commerce', 'Partagez vos astuces sur Alibaba, Shopify et le sourcing', false),
('💰 Finance & Crypto', 'finance', 'Investissements, Bitcoin et gestion financière', false),
('🧠 Mindset & Motivation', 'mindset', 'Développement personnel et leadership', false),
('💻 Tech & No-Code', 'tech', 'Outils, automatisation et développement', false),
('🤝 Opportunités Business', 'business', 'Offres de services, partenariats et networking', false)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;
