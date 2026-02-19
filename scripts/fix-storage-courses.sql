-- =====================================================
-- FIX STORAGE : BUCKET COURSES (THUMBNAILS)
-- =====================================================

-- 1. Créer le bucket 'courses' (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('courses', 'courses', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Policies pour le storage courses
DROP POLICY IF EXISTS "Public Access Courses" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Courses" ON storage.objects;

CREATE POLICY "Public Access Courses" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'courses' );

CREATE POLICY "Authenticated Upload Courses" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'courses' );

-- Note: RLS sur storage.objects est déjà actif ou désactivé globalement couramment
