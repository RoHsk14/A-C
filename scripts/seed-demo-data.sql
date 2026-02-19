-- ============================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================
-- Ce fichier contient des données de test pour l'application Afro-Circle
-- Exécuter dans le SQL Editor de Supabase APRÈS avoir créé un utilisateur admin

-- ============================================
-- 1. ESPACES DE DISCUSSION
-- ============================================

-- Espace Général
INSERT INTO spaces (slug, name, description, is_private) VALUES
('general', '🌍 Général', 'Espace de discussion général pour toute la communauté', false);

-- ============================================
-- 2. COURS E-COMMERCE
-- ============================================

-- Récupérer l'ID du premier admin pour l'utiliser comme instructeur
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Trouver un admin (prendre le premier)
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- Si on a trouvé un admin, créer les cours
  IF admin_id IS NOT NULL THEN
    
    -- Cours 1: Sourcing Produits en Chine
    INSERT INTO courses (
      title, 
      slug, 
      description, 
      price_xof, 
      price_usd, 
      instructor_id,
      is_published
    ) VALUES (
      'Sourcing Produits en Chine',
      'sourcing-produits-en-chine',
      'Apprenez à trouver et importer des produits rentables depuis la Chine. Maîtrisez AliExpress, Alibaba et les agents de sourcing.',
      75000,
      12500,
      admin_id,
      true
    );

    -- Cours 2: Facebook Ads pour E-commerce
    INSERT INTO courses (
      title, 
      slug, 
      description, 
      price_xof, 
      price_usd, 
      instructor_id,
      is_published
    ) VALUES (
      'Facebook Ads pour E-commerce',
      'facebook-ads-pour-ecommerce',
      'Créez des campagnes publicitaires Facebook rentables. De la création d''audiences à l''optimisation des conversions.',
      85000,
      14200,
      admin_id,
      true
    );

    -- Cours 3: Branding & Identité Visuelle
    INSERT INTO courses (
      title, 
      slug, 
      description, 
      price_xof, 
      price_usd, 
      instructor_id,
      is_published
    ) VALUES (
      'Branding & Identité Visuelle',
      'branding-identite-visuelle',
      'Construisez une marque forte qui se démarque. Logo, charte graphique, storytelling et positionnement.',
      65000,
      10800,
      admin_id,
      true
    );
    
  END IF;
END $$;

-- ============================================
-- 3. LEÇONS POUR CHAQUE COURS
-- ============================================

-- Leçons pour "Sourcing Produits en Chine"
INSERT INTO lessons (course_id, title, content, order_index, is_preview) 
SELECT 
  id,
  'Introduction au Sourcing',
  '# Introduction au Sourcing

Bienvenue dans cette formation sur le sourcing de produits en Chine !
## Ce que vous allez apprendre

- Les bases du sourcing international
- Les plateformes principales (AliExpress, Alibaba, 1688)
- Comment évaluer un fournisseur
- Les pièges à éviter

## Pourquoi sourcer en Chine ?

La Chine est l''usine du monde. Des millions de produits à des prix imbattables.',
  1,
  true
FROM courses WHERE slug = 'sourcing-produits-en-chine';

INSERT INTO lessons (course_id, title, content, order_index) 
SELECT 
  id,
  'Maîtriser AliExpress',
  '# Maîtriser AliExpress

AliExpress est la porte d''entrée idéale pour les débutants.

## Avantages
- Petites quantités
- Paiement sécurisé
- Livraison internationale

## Comment trouver les meilleurs produits
1. Utiliser les filtres avancés
2. Analyser les avis clients
3. Comparer les fournisseurs',
  2
FROM courses WHERE slug = 'sourcing-produits-en-chine';

INSERT INTO lessons (course_id, title, content, order_index) 
SELECT 
  id,
  'Alibaba et les Grossistes',
  '# Alibaba et les Grossistes

Passez au niveau supérieur avec Alibaba.

## Différences avec AliExpress
- Quantités minimales (MOQ)
- Prix de gros
- Négociation possible

## Trouver un bon fournisseur
- Vérifier les certifications
- Demander des échantillons
- Négocier les prix',
  3
FROM courses WHERE slug = 'sourcing-produits-en-chine';

-- Leçons pour "Facebook Ads pour E-commerce"
INSERT INTO lessons (course_id, title, content, order_index, is_preview) 
SELECT 
  id,
  'Les Fondamentaux de Facebook Ads',
  '# Les Fondamentaux de Facebook Ads

Découvrez la puissance de la publicité Facebook.

## Pourquoi Facebook Ads ?
- 2+ milliards d''utilisateurs
- Ciblage ultra-précis
- ROI mesurable

## Structure d''une campagne
1. Campagne (Objectif)
2. Ensemble de publicités (Audience)
3. Publicité (Créatif)',
  1,
  true
FROM courses WHERE slug = 'facebook-ads-pour-ecommerce';

INSERT INTO lessons (course_id, title, content, order_index) 
SELECT 
  id,
  'Créer des Audiences Rentables',
  '# Créer des Audiences Rentables

Le ciblage est la clé du succès.

## Types d''audiences
- Audiences froides (Lookalike)
- Audiences chaudes (Engagement)
- Audiences chaudes (Retargeting)

## Stratégie de ciblage
1. Commencer large
2. Analyser les données
3. Affiner progressivement',
  2
FROM courses WHERE slug = 'facebook-ads-pour-ecommerce';

-- Leçons pour "Branding & Identité Visuelle"
INSERT INTO lessons (course_id, title, content, order_index, is_preview) 
SELECT 
  id,
  'Qu''est-ce qu''une Marque ?',
  '# Qu''est-ce qu''une Marque ?

Une marque, c''est bien plus qu''un logo.

## Les éléments d''une marque
- Identité visuelle (logo, couleurs)
- Ton et voix
- Valeurs et mission
- Expérience client

## Pourquoi le branding est crucial
- Différenciation
- Fidélisation
- Prix premium',
  1,
  true
FROM courses WHERE slug = 'branding-identite-visuelle';

INSERT INTO lessons (course_id, title, content, order_index) 
SELECT 
  id,
  'Créer un Logo Mémorable',
  '# Créer un Logo Mémorable

Votre logo est le visage de votre marque.

## Principes d''un bon logo
- Simple et mémorable
- Intemporel
- Versatile
- Approprié

## Outils de création
- Canva (débutants)
- Adobe Illustrator (avancé)
- Fiverr (délégation)',
  2
FROM courses WHERE slug = 'branding-identite-visuelle';

-- ============================================
-- 4. ESPACES DE DISCUSSION PAR COURS
-- ============================================

-- Créer un espace pour chaque cours
INSERT INTO spaces (slug, name, description, is_private, course_id)
SELECT 
  slug || '-discussion',
  '💬 ' || title,
  'Espace de discussion pour les élèves de "' || title || '"',
  true,
  id
FROM courses;

-- ============================================
-- 5. POSTS DE BIENVENUE
-- ============================================

-- Récupérer l'ID de l'espace Général
DO $$
DECLARE
  general_space_id UUID;
  admin_id UUID;
BEGIN
  -- Trouver l'espace Général
  SELECT id INTO general_space_id FROM spaces WHERE slug = 'general' LIMIT 1;
  
  -- Trouver un admin (prendre le premier)
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- Si on a trouvé les deux, créer les posts
  IF general_space_id IS NOT NULL AND admin_id IS NOT NULL THEN
    
    -- Post 1: Bienvenue
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '🎉 Bienvenue sur Afro-Circle !

Nous sommes ravis de vous accueillir dans cette communauté d''entrepreneurs africains passionnés par l''e-commerce.

Ici, vous pourrez :
- Apprendre grâce à nos formations
- Échanger avec d''autres entrepreneurs
- Partager vos réussites et vos défis

N''hésitez pas à vous présenter ! 👋'
    );
    
    -- Post 2: Conseil Sourcing
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '💡 Conseil du jour : Sourcing

Avant de commander en gros, commandez TOUJOURS des échantillons !

Cela vous permet de :
✅ Vérifier la qualité
✅ Tester le délai de livraison
✅ Évaluer le service client du fournisseur

Un échantillon à 20€ peut vous éviter de perdre 2000€ sur une mauvaise commande.'
    );
    
    -- Post 3: Success Story
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '🚀 Success Story

Amadou, membre de notre communauté, vient de faire son premier 1M XOF de CA !

Son secret ? 
- Niche bien choisie (accessoires téléphone)
- Sourcing maîtrisé
- Facebook Ads optimisées

Bravo Amadou ! 🎊

Qui sera le prochain ? 💪'
    );
    
    -- Post 4: Astuce Facebook Ads
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '📱 Astuce Facebook Ads

Vos publicités ne convertissent pas ? Vérifiez ces 3 points :

1️⃣ Votre image attire-t-elle l''attention ?
2️⃣ Votre texte parle-t-il des BÉNÉFICES (pas des caractéristiques) ?
3️⃣ Votre CTA est-il clair et urgent ?

Testez toujours plusieurs variantes ! A/B testing = 🔑'
    );
    
    -- Post 5: Motivation
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '💪 Motivation du lundi

"Le succès n''est pas la clé du bonheur. Le bonheur est la clé du succès. Si vous aimez ce que vous faites, vous réussirez."

Passez une excellente semaine, entrepreneurs ! 🌟'
    );
    
    -- Post 6: Question Communauté
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '❓ Question pour la communauté

Quelle est votre plus grande difficulté en ce moment dans votre business e-commerce ?

A. Trouver des produits rentables
B. Générer du trafic
C. Convertir les visiteurs en clients
D. Gérer la logistique

Répondez en commentaire ! 👇'
    );
    
    -- Post 7: Outil Recommandé
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '🛠️ Outil de la semaine : Canva

Canva est un outil gratuit pour créer :
- Logos
- Publicités Facebook
- Stories Instagram
- Miniatures YouTube

Même sans compétences en design, vous pouvez créer du contenu professionnel en quelques minutes.

Lien : canva.com'
    );
    
    -- Post 8: Erreur à Éviter
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '⚠️ Erreur à éviter

Ne copiez JAMAIS exactement ce que fait un concurrent.

Pourquoi ?
- Vous arrivez toujours en retard
- Vous ne vous différenciez pas
- Vous ne comprenez pas leur stratégie complète

Inspirez-vous, mais innovez ! 💡'
    );
    
    -- Post 9: Webinar Annonce
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '📅 Webinar gratuit ce vendredi !

Thème : "Comment trouver un produit gagnant en 2024"

Au programme :
- Méthode de recherche de produits
- Analyse de la concurrence
- Validation de niche
- Q&A en direct

Inscrivez-vous dans votre espace membre ! 🎓'
    );
    
    -- Post 10: Remerciement
    INSERT INTO posts (space_id, author_id, content) VALUES (
      general_space_id,
      admin_id,
      '🙏 Merci à vous !

Nous sommes déjà 100+ entrepreneurs dans cette communauté !

Votre énergie et votre engagement nous motivent chaque jour.

Continuons à grandir ensemble ! 🚀

#AfroCircle #Entrepreneuriat #Ecommerce'
    );
    
  END IF;
END $$;

-- ============================================
-- RÉSUMÉ
-- ============================================
-- ✅ 1 Espace Général
-- ✅ 3 Cours E-commerce
-- ✅ 7 Leçons au total
-- ✅ 3 Espaces de discussion par cours
-- ✅ 10 Posts de bienvenue
