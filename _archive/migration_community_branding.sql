-- Add branding columns to communities table
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4F46E5', -- Default Indigo-600
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'communities';
