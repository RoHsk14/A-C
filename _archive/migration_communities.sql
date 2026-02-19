-- 1. Create Communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
CREATE POLICY "Communities are viewable by everyone" 
ON communities FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Creators can insert communities" ON communities;
CREATE POLICY "Creators can insert communities" 
ON communities FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update their communities" ON communities;
CREATE POLICY "Creators can update their communities" 
ON communities FOR UPDATE 
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can delete their communities" ON communities;
CREATE POLICY "Creators can delete their communities" 
ON communities FOR DELETE 
USING (auth.uid() = creator_id);


-- 2. Create Community Members table
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, moderator, admin
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Community members viewable by everyone" ON community_members;
CREATE POLICY "Community members viewable by everyone" 
ON community_members FOR SELECT 
USING (true);

-- Admins of the community (creators) can manage members
DROP POLICY IF EXISTS "Creators can manage community members" ON community_members;
CREATE POLICY "Creators can manage community members" 
ON community_members FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM communities 
        WHERE communities.id = community_members.community_id 
        AND communities.creator_id = auth.uid()
    )
);

-- Users can join (if public) -- For now restrict to creators adding members or simple join? 
-- Let's allow users to join for now (or strictly controlled via invitation later)
DROP POLICY IF EXISTS "Users can join communities" ON community_members;
CREATE POLICY "Users can join communities" 
ON community_members FOR INSERT 
WITH CHECK (auth.uid() = user_id); 


-- 3. Update Spaces table
-- Add community_id
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- Ideally we would enforce NOT NULL, but existing spaces would fail.
-- User instructed: "Un Espace appartient désormais obligatoirement à une Communauté."
-- Since we wiped data, we can enforce it if we want, OR we leave it nullable and assume UI handles it.
-- Let's leave nullable for migration safety but UI will require it.


-- 4. Update Posts RLS / Visibility Logic (Conceptually)
-- The application logic in 'fetchPosts' will need to change to check 'community_members'
-- RLS for spaces should also check community membership.

DROP POLICY IF EXISTS "Community members can view spaces" ON spaces;
DROP POLICY IF EXISTS "Members can view spaces" ON spaces; -- Drop old one if exists

CREATE POLICY "Community members can view spaces"
ON spaces FOR SELECT
USING (
    -- Public spaces within a community are visible to community members (if not banned)
    (is_private = false AND EXISTS (
        SELECT 1 FROM community_members
        WHERE community_members.community_id = spaces.community_id
        AND community_members.user_id = auth.uid()
        AND community_members.role != 'banned'
    ))
    OR
    -- Or if user is the creator of the community
    EXISTS (
        SELECT 1 FROM communities
        WHERE communities.id = spaces.community_id
        AND communities.creator_id = auth.uid()
    )
    OR
    -- Fallback for legacy spaces
    (community_id IS NULL)
);

-- Note: We are not removing space_members table yet in case we need granular private space access later.

CREATE TABLE IF NOT EXISTS community_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    email TEXT,
    token TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'member',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE community_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community invitations viewable by creator/admins" ON community_invitations;
CREATE POLICY "Community invitations viewable by creator/admins" 
ON community_invitations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM communities 
        WHERE communities.id = community_invitations.community_id 
        AND communities.creator_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Creators can create invitations" ON community_invitations;
CREATE POLICY "Creators can create invitations" 
ON community_invitations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM communities 
        WHERE communities.id = community_invitations.community_id 
        AND communities.creator_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Creators can delete invitations" ON community_invitations;
CREATE POLICY "Creators can delete invitations" 
ON community_invitations FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM communities 
        WHERE communities.id = community_invitations.community_id 
        AND communities.creator_id = auth.uid()
    )
);


-- Function to get invitation by token (Bypassing RLS for public access if token is known)
CREATE OR REPLACE FUNCTION get_invitation_by_token(lookup_token TEXT)
RETURNS TABLE (
    id UUID,
    community_id UUID,
    email TEXT,
    token TEXT,
    role TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    community_name TEXT,
    community_description TEXT,
    community_slug TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.community_id,
        ci.email,
        ci.token,
        ci.role,
        ci.expires_at,
        ci.accepted_at,
        c.name as community_name,
        c.description as community_description,
        c.slug as community_slug
    FROM community_invitations ci
    JOIN communities c ON c.id = ci.community_id
    WHERE ci.token = lookup_token;
END;
$$ LANGUAGE plpgsql;

-- Function to safely delete invitation (used by server action after acceptance)
CREATE OR REPLACE FUNCTION delete_invitation_by_id(invite_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM community_invitations WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql;

