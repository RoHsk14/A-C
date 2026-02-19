-- Add community_id to courses table
ALTER TABLE courses 
ADD COLUMN community_id UUID REFERENCES communities(id);

-- Create an index for performance
CREATE INDEX idx_courses_community_id ON courses(community_id);

-- Optional: If we want to enforce that a course MUST belong to a community eventually, we can add NOT NULL later.
-- For now, allow NULL for existing courses or "global" courses.

-- RLS: Update policies if needed. 
-- Currently, courses are likely visible if public or purchased. 
-- We might want to ensure that if a course is in a private community, only members can see it.
-- This logic is often handled in application code for listing, but RLS is safer.

-- Example policy update (commented out for now, to be applied if RLS is strict):
-- CREATE POLICY "Members can view community courses" ON courses
-- FOR SELECT USING (
--   community_id IS NULL OR 
--   EXISTS (SELECT 1 FROM community_members WHERE community_id = courses.community_id AND user_id = auth.uid())
-- );
