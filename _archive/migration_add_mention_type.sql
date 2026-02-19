-- Add 'mention' to the allowed types for notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('comment_reply', 'new_lesson', 'post_like', 'course_update', 'mention'));
