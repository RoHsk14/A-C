-- 1. MEDIA & ATTACHMENTS
-- Add attachments column to posts and comments
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;

-- Create course_resources table
CREATE TABLE IF NOT EXISTS course_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT, -- 'pdf', 'xlsx', 'image', etc.
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for course_resources
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;

-- Everyone who can view the course can view resources (simplified for now to public/enrolled)
-- For now, let's allow authenticated users to view if they have access to the course content (which is handled by app logic usually, but row level security is better)
-- Re-using the logic that "if you can see the course, you can see resources". 
-- Since courses are public or have enrollment checks, we'll keep it simple: Anyone authenticated can SELECT for now, app logic handles enrollment check.
DROP POLICY IF EXISTS "Authenticated users can view resources" ON course_resources;
CREATE POLICY "Authenticated users can view resources" 
ON course_resources FOR SELECT 
TO authenticated 
USING (true);

-- Only admins/creators can insert/update/delete
DROP POLICY IF EXISTS "Admins and creators can manage resources" ON course_resources;
CREATE POLICY "Admins and creators can manage resources" 
ON course_resources FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'creator')
    )
);


-- 2. NOTIFICATIONS
CREATE TYPE notification_type AS ENUM ('reply_post', 'reply_comment', 'mention', 'course_update', 'invite', 'system');

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Recipient
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Triggered by
    type notification_type NOT NULL,
    title TEXT,
    message TEXT,
    link TEXT, -- URL to redirect to
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    related_id UUID -- ID of the post/comment context
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);


-- 3. MODERATION (REPORTS)
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE report_target_type AS ENUM ('post', 'comment', 'course', 'user');

CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type report_target_type NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" 
ON reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view reports" ON reports;
CREATE POLICY "Admins can view reports" 
ON reports FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can update reports" ON reports;
CREATE POLICY "Admins can update reports" 
ON reports FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
