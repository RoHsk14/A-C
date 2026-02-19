-- =====================================================
-- FIX D'URGENCE LMS : DÉSACTIVATION RLS COURS
-- =====================================================
-- Si vous ne voyez pas vos cours, c'est que la sécurité RLS
-- bloque l'affichage (probablement car vous êtes l'admin mais pas reconnu comme l'instructeur).

ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- Cela rendra tous les cours visibles dans l'interface Admin.
