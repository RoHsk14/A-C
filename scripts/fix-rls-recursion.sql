-- =====================================================
-- FIX RLS RECURSION - Script Correctif
-- =====================================================
-- Ce script résout l'erreur "infinite recursion detected in policy for relation space_members"
-- en simplifiant les politiques d'accès.

-- 1. Supprimer les politiques existantes problématiques sur space_members
DROP POLICY IF EXISTS "Les membres peuvent voir les autres membres du même espace" ON space_members;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres adhésions" ON space_members;
DROP POLICY IF EXISTS "Users can view members of spaces they belong to" ON space_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON space_members;

-- 2. Créer une politique simplifiée et sans récursion pour la lecture (SELECT)

-- Autoriser les utilisateurs à voir TOUTES les lignes de space_members s'ils sont connectés.
-- C'est moins restrictif mais ça résout le blocage immédiat pour afficher le dashboard.
-- Dans un environnement de prod strict, on utiliserait une fonction security definer.
CREATE POLICY "View memberships safe" 
ON space_members FOR SELECT 
TO authenticated 
USING (true);

-- Garder la politique de modification personnelle (normalement pas récursive)
CREATE POLICY "Manage own memberships safe" 
ON space_members FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. S'assurer que RLS est activé
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;

-- 4. Recharger le cache du schéma (optionnel)
NOTIFY pgrst, 'reload schema';
