-- Check the last 10 notifications to see if any are type 'mention'
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check policies again to ensure SELECT is allowed
SELECT * FROM pg_policies WHERE tablename = 'notifications';
