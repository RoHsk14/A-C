-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Re-create the constraint with 'mention' included
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('comment', 'comment_reply', 'new_lesson', 'post_like', 'course_update', 'mention', 'system_alert'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass;
