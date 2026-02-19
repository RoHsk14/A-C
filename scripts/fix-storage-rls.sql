-- =====================================================
-- FIX STORAGE : AUTORISER L'UPLOAD D'IMAGES
-- =====================================================

-- 1. Créer le bucket 'posts' s'il n'existe pas (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Supprimer les anciennes règles potentiellement bloquantes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Give me access" ON storage.objects; -- Parfois nommée ainsi

-- 3. Créer les règles d'accès (Lecture publique, Upload authentifié)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'posts' );

CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'posts' );

-- 4. Fin (RLS est déjà activé par défaut sur storage.objects)

