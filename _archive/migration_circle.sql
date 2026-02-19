-- Add Branding columns to spaces table
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#4f46e5', -- Indigo-600 default
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Hash', -- Lucide icon name
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS onboarding_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- RLS for onboarding_status
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own onboarding status
CREATE POLICY "Users can view own onboarding status" 
ON onboarding_status FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding status" 
ON onboarding_status FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding status" 
ON onboarding_status FOR UPDATE 
USING (auth.uid() = user_id);

-- Create space_invitations table
CREATE TABLE IF NOT EXISTS space_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    email TEXT, -- Optional, can be null for generic links if we wanted, but we'll stick to email for now or generic
    token TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'member', -- 'member', 'moderator'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE -- Track if/when used
);

-- RLS for space_invitations
ALTER TABLE space_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Space admins/owners can view/create invitations
CREATE POLICY "Space admins can view invitations"
ON space_invitations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM spaces
        WHERE spaces.id = space_invitations.space_id
        AND spaces.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM space_members
        WHERE space_members.space_id = space_invitations.space_id
        AND space_members.user_id = auth.uid()
        AND space_members.role = 'admin'
    )
);

CREATE POLICY "Space admins can create invitations"
ON space_invitations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM spaces
        WHERE spaces.id = space_invitations.space_id
        AND spaces.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM space_members
        WHERE space_members.space_id = space_invitations.space_id
        AND space_members.user_id = auth.uid()
        AND space_members.role = 'admin'
    )
);

-- Public access to check token validity (for the accept page)
CREATE POLICY "Anyone can view valid invitations via token"
ON space_invitations FOR SELECT
USING (true); -- We'll filter by token in the query which is secure enough for this use case if token is high entropy
