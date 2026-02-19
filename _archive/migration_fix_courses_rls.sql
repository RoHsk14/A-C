-- =====================================================
-- Fix: Admin Access to All Courses
-- =====================================================
-- This migration fixes the RLS policy for courses to:
-- 1. Use correct column name (is_published instead of status)
-- 2. Allow admins to view ALL courses

-- Drop old policy
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;

-- Create new policy with admin access
CREATE POLICY "Courses viewable by everyone (published) and admins"
  ON courses FOR SELECT
  USING (
    is_published = TRUE 
    OR instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
