-- =======================================================
-- SCRIPT COMPLET DE RÉPARATION UTILISATEURS
-- =======================================================

-- 1. Modification du schéma : Ajouter la colonne email
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Mise à jour du Trigger (pour les futurs utilisateurs)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email, -- Sauvegarde de l'email
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sync : Créer les profils manquants
INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    au.email,
    CASE WHEN au.email = 'admin@afrocircle.com' THEN 'admin' ELSE 'user' END,
    au.created_at,
    now()
FROM auth.users au
LEFT JOIN public.profiles pp ON au.id = pp.id
WHERE pp.id IS NULL;

-- 4. Sync : Remplir les emails des profils existants (si vides)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id 
AND p.email IS NULL;

-- 5. Force Admin Role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@afrocircle.com';

-- 6. Vérification finale
SELECT count(*) as total_users_with_email 
FROM public.profiles 
WHERE email IS NOT NULL;
