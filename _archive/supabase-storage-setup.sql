-- ============================================
-- CONFIGURATION SUPABASE STORAGE
-- ============================================
-- Ce fichier contient les commandes pour configurer le stockage Supabase
-- Exécuter dans le SQL Editor de Supabase

-- 1. Créer le bucket pour les miniatures de cours
-- Note: Les buckets doivent être créés via l'interface Supabase Storage
-- Aller dans Storage > Create bucket
-- Nom: course-thumbnails
-- Public: true

-- 2. Politique RLS pour le bucket course-thumbnails
-- Permettre à tout le monde de lire les images
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
SELECT 'course-thumbnails', '', auth.uid(), '{}'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'course-thumbnails'
);

-- 3. Politique de lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

-- 4. Politique d'upload pour les admins uniquement
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- 5. Politique de suppression pour les admins uniquement
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-thumbnails' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- ============================================
-- INSTRUCTIONS MANUELLES
-- ============================================
-- 1. Aller dans Supabase Dashboard > Storage
-- 2. Cliquer sur "New bucket"
-- 3. Nom: course-thumbnails
-- 4. Cocher "Public bucket"
-- 5. Cliquer sur "Create bucket"
-- 6. Exécuter les politiques RLS ci-dessus dans le SQL Editor
