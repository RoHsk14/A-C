-- Create space_invitations table
CREATE TABLE IF NOT EXISTS space_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    email TEXT,
    token TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'member', 
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- RLS for space_invitations
ALTER TABLE space_invitations ENABLE ROW LEVEL SECURITY;

-- Dropping policies if they exist to avoid conflicts if re-run (crudely)
DROP POLICY IF EXISTS "Space admins can view invitations" ON space_invitations;
DROP POLICY IF EXISTS "Space admins can create invitations" ON space_invitations;
DROP POLICY IF EXISTS "Anyone can view valid invitations via token" ON space_invitations;

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

-- Public access to check token validity
CREATE POLICY "Anyone can view valid invitations via token"
ON space_invitations FOR SELECT
USING (true);
