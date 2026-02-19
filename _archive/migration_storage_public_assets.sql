-- Create a new public bucket for public assets (logos, covers, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_assets', 'public_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Give public access to view files
CREATE POLICY "Public Assets are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public_assets' );

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload public assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'public_assets' 
    AND auth.role() = 'authenticated'
);

-- Policy: Allow users to update their own uploads (optional, but good for cleanup)
CREATE POLICY "Users can update their own public assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'public_assets' 
    AND auth.uid() = owner
);

-- Policy: Allow users to delete their own uploads
CREATE POLICY "Users can delete their own public assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'public_assets' 
    AND auth.uid() = owner
);
