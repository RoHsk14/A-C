-- Add type column to spaces table
ALTER TABLE spaces
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'voice'));

-- Update existing spaces to be 'text' (redundant with default but good for clarity)
UPDATE spaces SET type = 'text' WHERE type IS NULL;
