-- Migration: Fix RLS policy for course completion
-- Allow users to update their own enrollments (for marking courses as completed)

-- Add policy for users to update their own enrollments
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrollments;

CREATE POLICY "Users can update their own enrollments"
ON enrollments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Comment
COMMENT ON POLICY "Users can update their own enrollments" ON enrollments 
IS 'Allows users to update their own enrollment records, such as marking courses as completed';
