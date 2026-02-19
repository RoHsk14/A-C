-- 1. Database Cleanup
-- Delete all user generated content
DELETE FROM notifications;
DELETE FROM reports;
DELETE FROM likes;
DELETE FROM comments;
DELETE FROM posts;

-- 4. Delete orphaned spaces (No members linked)
-- This removes spaces that have no one in them (test spaces)
DELETE FROM spaces 
WHERE id NOT IN (SELECT DISTINCT space_id FROM space_members);

-- 2. Schema Update for filtering
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
