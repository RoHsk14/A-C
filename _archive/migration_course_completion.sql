-- =====================================================
-- Migration: Course Completion Feature
-- =====================================================
-- This migration adds the ability for users to mark courses as completed
-- 1. Adds completed_at column to enrollments table
-- 2. Adds RLS policy to allow users to update their own enrollments

-- =====================================================
-- STEP 1: Add completed_at column
-- =====================================================

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add index for faster queries on completed courses
CREATE INDEX IF NOT EXISTS idx_enrollments_completed_at 
ON enrollments(completed_at) 
WHERE completed_at IS NOT NULL;

-- Comment
COMMENT ON COLUMN enrollments.completed_at IS 'Timestamp when the user completed the course';

-- =====================================================
-- STEP 2: Add RLS policy for users to update their own enrollments
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrollments;

-- Create policy to allow users to update their own enrollments
CREATE POLICY "Users can update their own enrollments"
ON enrollments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Comment
COMMENT ON POLICY "Users can update their own enrollments" ON enrollments 
IS 'Allows users to update their own enrollment records, such as marking courses as completed';
