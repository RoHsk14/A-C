-- =====================================================
-- MIGRATION: Modules System Hierarchy
-- =====================================================

-- 1. Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for modules
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(course_id, order_index);

-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Modules
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON modules;
CREATE POLICY "Modules are viewable by everyone"
  ON modules FOR SELECT
  USING (true);

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

-- 2. Add module_id to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
