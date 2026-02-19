-- =====================================================
-- FIX COMPLET : RLS & ACCÈS AUX ESPACES
-- =====================================================
-- Exécutez ce script pour débloquer l'affichage des Espaces et des Posts.

-- 1. Réparer Space Members (Problème de Récursion)
DROP POLICY IF EXISTS "View memberships safe" ON space_members;
DROP POLICY IF EXISTS "Les membres peuvent voir les autres membres du même espace" ON space_members;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres adhésions" ON space_members;
DROP POLICY IF EXISTS "Users can view members of spaces they belong to" ON space_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON space_members;
DROP POLICY IF EXISTS "Manage own memberships safe" ON space_members;

-- Politique simple : tout membre connecté peut voir les memberships (nécessaire pour afficher les auteurs)
CREATE POLICY "View memberships safe" 
ON space_members FOR SELECT 
TO authenticated 
USING (true);

-- Politique simple : chacun gère son adhésion
CREATE POLICY "Manage own memberships safe" 
ON space_members FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;

-- 2. Réparer l'accès aux Espaces (Spaces ne s'affichent pas)
DROP POLICY IF EXISTS "All spaces viewable" ON spaces;
DROP POLICY IF EXISTS "Public spaces are viewable by everyone" ON spaces;
DROP POLICY IF EXISTS "Private spaces are viewable by members" ON spaces;

-- Politique simple : tout le monde peut voir tous les espaces (pour le test)
CREATE POLICY "All spaces viewable" 
ON spaces FOR SELECT 
TO authenticated 
USING (true);

ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- 3. Réparer l'accès aux Posts (Posts ne s'affichent pas)
DROP POLICY IF EXISTS "Posts are viewable by everyone in public spaces" ON posts;
DROP POLICY IF EXISTS "Posts are viewable by members in private spaces" ON posts;
DROP POLICY IF EXISTS "View all posts safe" ON posts;
DROP POLICY IF EXISTS "Create posts safe" ON posts;

CREATE POLICY "View all posts safe"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Create posts safe"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Force le rechargement du schéma
NOTIFY pgrst, 'reload schema';
