-- =====================================================
-- TRIGGER: Synchronisation continue du profil
-- =====================================================
-- Met à jour la table public.profiles quand les métadonnées
-- de auth.users changent (ex: nouvelle photo Google)
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si les métadonnées ont changé
  IF (NEW.raw_user_meta_data->>'avatar_url' IS DISTINCT FROM OLD.raw_user_meta_data->>'avatar_url') OR
     (NEW.raw_user_meta_data->>'name' IS DISTINCT FROM OLD.raw_user_meta_data->>'name') THEN
     
    UPDATE public.profiles
    SET 
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
      name = COALESCE(NEW.raw_user_meta_data->>'name', name),
      updated_at = NOW()
    WHERE id = NEW.id;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attacher le trigger à la table auth.users pour les UPDATE
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile();
