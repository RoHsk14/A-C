-- Verify if community_members has a foreign key to profiles?
-- Currently community_members references auth.users(id).
-- But we are trying to join with profiles.
-- Supabase automatically detects foreign keys.
-- Since profiles.id references auth.users(id), and community_members.user_id references auth.users(id), they are related.
-- However, for the query `profile:profiles(...)` to work on `community_members`, there should ideally be a direct FK or Supabase infers it if names match?
-- community_members.user_id -> profiles.id

-- Let's explicitely add a FK from community_members.user_id to profiles.id IF IT HELPS PostgREST.
-- Actually, usually PostgREST uses the FK to determine the relationship.
-- community_members.user_id references auth.users.
-- profiles.id references auth.users.
-- They are siblings.
-- Query was: .select('..., profile:profiles(...)') from community_members.
-- This implies community_members has a FK to profiles.
-- BUT IT DOES NOT! It references auth.users.
-- FIX: We should make community_members.user_id reference profiles(id) OR auth.users(id).
-- If it references auth.users, and profiles references auth.users, PostgREST might not see a direct link between community_members and profiles unless we hint it or structure it properly.

-- BETTER FIX:
-- PostgREST can join tables if there is a FK.
-- If I want community_members -> profiles, I should have a FK.
-- Let's try to add a FK from community_members.user_id to profiles.id (since profiles.id is PK and same type).
-- Note: profiles.id IS auth.users.id.
-- So changing the FK constraint to point to public.profiles instead of auth.users might fix the join detection.

ALTER TABLE community_members
DROP CONSTRAINT IF EXISTS community_members_user_id_fkey;

ALTER TABLE community_members
ADD CONSTRAINT community_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Also ensure profiles are distinct
