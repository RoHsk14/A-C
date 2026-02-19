-- =======================================================
-- FIX RLS : ACCÈS ADMIN AUX INSCRIPTIONS
-- =======================================================
-- L'erreur 42501 (Insufficient Privilege) vient du fait qu'il n'y avait pas
-- de politique permettant l'INSERTion dans la table enrollments
-- (c'était réservé aux webhooks auparavant).

-- 1. Activer RLS sur enrollments (au cas où)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 2. Politique : Les Admins peuvent TOUT faire sur les enrollments
-- (Insert, Update, Delete, Select)

DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;

CREATE POLICY "Admins can manage all enrollments"
ON enrollments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. Vérification : S'assurer que les profils sont lisibles pour la vérification
-- (Normalement déjà bon, mais sécurité)
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON profiles;
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
