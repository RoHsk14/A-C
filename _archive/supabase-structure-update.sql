-- =====================================================
-- MIGRATION: Update Structure & Security
-- =====================================================

-- 1. Update profiles role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'creator', 'member'));

-- 2. Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for modules
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(course_id, order_index);

-- Enable RLS for modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- RLS for Modules (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON modules;
CREATE POLICY "Modules are viewable by everyone"
  ON modules FOR SELECT
  USING (true); -- Publicly viewable for structure, content is in lessons

DROP POLICY IF EXISTS "Instructors can manage modules" ON modules;
CREATE POLICY "Instructors can manage modules"
  ON modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- 3. Update lessons table
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'module_id') THEN
    ALTER TABLE lessons ADD COLUMN module_id UUID REFERENCES modules(id) ON DELETE SET NULL;
    CREATE INDEX idx_lessons_module_id ON lessons(module_id);
  END IF;
END $$;

-- 4. Add space_id to courses (to link Course -> Community)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'space_id') THEN
    ALTER TABLE courses ADD COLUMN space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;
    CREATE INDEX idx_courses_space_id ON courses(space_id);
  END IF;
END $$;

-- 5. Trigger for automatic space membership on Enrollment
CREATE OR REPLACE FUNCTION public.handle_new_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  linked_space_id UUID;
BEGIN
  -- Get the space_id from the course
  SELECT space_id INTO linked_space_id
  FROM courses
  WHERE id = NEW.course_id;

  -- If a space is linked, add the user to it
  IF linked_space_id IS NOT NULL THEN
    INSERT INTO space_members (space_id, user_id, role)
    VALUES (linked_space_id, NEW.user_id, 'member')
    ON CONFLICT (space_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_enrollment_created ON enrollments;
CREATE TRIGGER on_enrollment_created
  AFTER INSERT ON enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_enrollment();
