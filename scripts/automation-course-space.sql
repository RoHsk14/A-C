-- =======================================================
-- AUTOMATION: COURSE <-> SPACE SYNC
-- =======================================================
-- Ce script :
-- 1. Ajoute une liaison entre Cours et Espaces.
-- 2. Crée un Trigger pour synchroniser automatiquement les inscriptions.

-- 1. Ajouter la colonne space_id à la table courses
-- Un cours peut être lié à un espace communautaire (optionnel)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;

-- Index pour les perfs
CREATE INDEX IF NOT EXISTS idx_courses_space_id ON courses(space_id);

-- 2. Fonction de Synchronisation
CREATE OR REPLACE FUNCTION public.sync_enrollment_to_space_member()
RETURNS TRIGGER AS $$
DECLARE
    target_space_id UUID;
    target_user_id UUID;
BEGIN
    -- CAS 1: Nouvelle Inscription (INSERT)
    IF (TG_OP = 'INSERT') THEN
        -- Vérifier si le cours est lié à un espace
        SELECT space_id INTO target_space_id
        FROM courses
        WHERE id = NEW.course_id;

        -- Si un espace est lié et l'inscription est ACTIVE
        IF target_space_id IS NOT NULL AND NEW.status = 'active' THEN
            INSERT INTO public.space_members (space_id, user_id, role)
            VALUES (target_space_id, NEW.user_id, 'member')
            ON CONFLICT (space_id, user_id) DO NOTHING; -- Déjà membre ? Pas grave.
        END IF;
    END IF;

    -- CAS 2: Mise à jour (UPDATE) - ex: Activation ou Annulation
    IF (TG_OP = 'UPDATE') THEN
        SELECT space_id INTO target_space_id
        FROM courses
        WHERE id = NEW.course_id;

        IF target_space_id IS NOT NULL THEN
            -- Si devient ACTIF -> Ajouter
            IF NEW.status = 'active' AND OLD.status != 'active' THEN
                INSERT INTO public.space_members (space_id, user_id, role)
                VALUES (target_space_id, NEW.user_id, 'member')
                ON CONFLICT (space_id, user_id) DO NOTHING;
            
            -- Si n'est PLUS ACTIF (Cancelled, Expired) -> Retirer
            ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
                DELETE FROM public.space_members
                WHERE space_id = target_space_id AND user_id = NEW.user_id;
            END IF;
        END IF;
    END IF;

    -- CAS 3: Suppression (DELETE)
    IF (TG_OP = 'DELETE') THEN
        SELECT space_id INTO target_space_id
        FROM courses
        WHERE id = OLD.course_id;

        IF target_space_id IS NOT NULL THEN
            DELETE FROM public.space_members
            WHERE space_id = target_space_id AND user_id = OLD.user_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attacher le Trigger
DROP TRIGGER IF EXISTS on_enrollment_change ON enrollments;

CREATE TRIGGER on_enrollment_change
AFTER INSERT OR UPDATE OR DELETE ON enrollments
FOR EACH ROW EXECUTE FUNCTION public.sync_enrollment_to_space_member();

-- 4. Backfill (Optionnel mais recommandé)
-- Synchroniser les inscriptions existantes
-- (Uniquement pour les inscriptions actives)
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT e.user_id, c.space_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.status = 'active' AND c.space_id IS NOT NULL
    LOOP
        INSERT INTO public.space_members (space_id, user_id, role)
        VALUES (rec.space_id, rec.user_id, 'member')
        ON CONFLICT (space_id, user_id) DO NOTHING;
    END LOOP;
END $$;
