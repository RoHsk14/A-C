-- =====================================================
-- SCRIPT DE CORRECTION: TRIGGER CRÉATION PROFIL
-- =====================================================
-- Ce script met à jour la fonction handle_new_user pour
-- gérer plus robustement les métadonnées manquantes
-- (ex: nom, avatar) lors de l'inscription OAuth/Email.
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  avatar TEXT;
BEGIN
  -- Récupération sécurisée du nom
  -- Priorité : raw_user_meta_data->name, puis full_name, puis email, puis "Utilisateur"
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'Utilisateur'
  );

  -- Récupération sécurisée de l'avatar
  -- Priorité : raw_user_meta_data->avatar_url, puis picture, puis NULL
  avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Insertion dans la table profiles avec gestion des conflits (si le profil existe déjà)
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    full_name,
    avatar
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log l'erreur mais ne bloque pas la création de l'utilisateur auth
  RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note : Le trigger existe déjà, pas besoin de le recréer si on replace juste la fonction.
-- Si besoin de forcer la recréation du trigger :
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
