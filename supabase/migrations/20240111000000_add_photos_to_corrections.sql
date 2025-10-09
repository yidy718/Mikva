-- Add photo_urls column to corrections table
ALTER TABLE corrections ADD COLUMN photo_urls TEXT[] DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_corrections_photo_urls ON corrections USING GIN (photo_urls);
