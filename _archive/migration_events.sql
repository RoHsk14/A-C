
-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    type TEXT NOT NULL CHECK (type IN ('live', 'voice', 'meetup')),
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

-- Insert sample data for existing communities
DO $$
DECLARE
    comm_id UUID;
BEGIN
    -- Try to get a community ID
    SELECT id INTO comm_id FROM communities LIMIT 1;

    IF comm_id IS NOT NULL THEN
        INSERT INTO events (community_id, title, start_time, type, link)
        VALUES 
            (comm_id, 'Masterclass E-commerce', NOW() + INTERVAL '2 days', 'live', '#'),
            (comm_id, 'Session Q&A Hebdo', NOW() + INTERVAL '5 days', 'voice', '#'),
            (comm_id, 'Rencontre Mensuelle', NOW() + INTERVAL '12 days', 'meetup', '#');
    END IF;
END $$;
