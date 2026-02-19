-- =======================================================
-- ENABLE CREATOR ROLE & RLS UPDATES
-- =======================================================
-- Ce script :
-- 1. Ajoute le rôle 'creator' à la base de données.
-- 2. Restreint la création de Cours/Espaces aux Admins et Créateurs.
-- 3. Donne aux Créateurs le pouvoir de gérer leurs membres.

-- 1. Mettre à jour la contrainte de rôle
-- D'abord, on essaie de trouver et supprimer l'ancienne contrainte
DO $$
DECLARE 
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Ajouter la nouvelle contrainte incluant 'creator'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'creator'));

-- 2. Mettre à jour les politiques RLS pour les COURS
-- Seuls Admins et Créateurs peuvent créer des cours
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;

CREATE POLICY "Creators and Admins can create courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'creator')
  )
  AND instructor_id = auth.uid()
);

-- 3. Mettre à jour les politiques RLS pour les ESPACES
-- Seuls Admins et Créateurs peuvent créer des espaces
DROP POLICY IF EXISTS "Authenticated users can create spaces" ON spaces;

CREATE POLICY "Creators and Admins can create spaces"
ON spaces FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'creator')
  )
);

-- 4. Permettre aux Créateurs d'inscrire des membres (Enrollments)
-- S'ils sont instructeurs du cours
CREATE POLICY "Creators can enroll users in their courses"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'creator')
  )
);

-- 5. Permettre aux Créateurs de voir/gérer les inscriptions DE LEURS COURS
-- (La politique existante "Instructors can view enrollments for their courses" couvre déjà le SELECT)
-- On ajoute UPDATE/DELETE pour gérer les révocations

CREATE POLICY "Instructors can manage enrollments for their courses"
ON enrollments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Instructors can cancel enrollments for their courses"
ON enrollments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid()
  )
);
