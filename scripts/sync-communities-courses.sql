-- 1. Sync Course Students -> Community Members
-- Adds users who are enrolled in a course to the linked community if they are not already members.

INSERT INTO community_members (community_id, user_id, role, joined_at)
SELECT DISTINCT
    c.community_id,
    e.user_id,
    'member',
    NOW()
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE c.community_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 
    FROM community_members cm 
    WHERE cm.community_id = c.community_id 
    AND cm.user_id = e.user_id
);

-- 2. Sync Community Members -> Course Enrollments (ALL Linked Courses)
-- Enrolls community members into all LINKED courses if they are not already enrolled.
-- Regardless of price (since membership grants access).

INSERT INTO enrollments (course_id, user_id, status, enrolled_at)
SELECT DISTINCT
    c.id,
    cm.user_id,
    'active',
    NOW()
FROM community_members cm
JOIN courses c ON cm.community_id = c.community_id
WHERE c.is_published = true
AND NOT EXISTS (
    SELECT 1 
    FROM enrollments e 
    WHERE e.course_id = c.id 
    AND e.user_id = cm.user_id
);
