-- =====================================================
-- MISE À JOUR LMS : MODULES & LEÇONS ÉVOLUÉES
-- =====================================================

-- 1. Création de la table 'modules'
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);

-- Activer RLS pour modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Politiques RLS modules (similaires aux cours)
CREATE POLICY "Public modules viewable for published courses"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.is_published = TRUE
    )
    OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage modules"
  ON modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- 2. Mise à jour de la table 'lessons'
-- Ajout de module_id
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE CASCADE;
-- Ajout de video_id (Mux)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_id TEXT;

-- Index pour module_id
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons(module_id, order_index);

-- 3. Trigger updated_at pour modules
DROP TRIGGER IF EXISTS set_updated_at ON modules;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Force le rechargement du schéma
NOTIFY pgrst, 'reload schema';
