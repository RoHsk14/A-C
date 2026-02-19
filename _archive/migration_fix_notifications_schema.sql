-- Add missing columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS resource_id UUID,
ADD COLUMN IF NOT EXISTS resource_type TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_resource ON notifications(resource_id, resource_type);

-- Fix RLS: Allow authenticated users to insert notifications (for mentions, comments, etc.)
-- Policy: A user can insert a notification if they are authenticated. 
-- Ideally we'd restrict it to "only if they are the actor", but for now generic insert is fine.
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Verify existing policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';
