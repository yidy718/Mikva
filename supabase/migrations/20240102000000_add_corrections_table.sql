-- Create corrections table for user-submitted corrections to mikvah information
CREATE TYPE correction_type AS ENUM ('incorrect_info', 'missing_info', 'outdated_info', 'other');
CREATE TYPE correction_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mikvah_id UUID NOT NULL REFERENCES mikvahs(id) ON DELETE CASCADE,
    type correction_type NOT NULL,
    field TEXT,
    current_value TEXT,
    suggested_value TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_email TEXT,
    status correction_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_corrections_mikvah_id ON corrections(mikvah_id);
CREATE INDEX idx_corrections_status ON corrections(status);
CREATE INDEX idx_corrections_created_at ON corrections(created_at DESC);

-- Enable RLS
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- Anyone can submit corrections
CREATE POLICY "Anyone can submit corrections"
    ON corrections FOR INSERT
    WITH CHECK (true);

-- Anyone can view corrections
CREATE POLICY "Anyone can view corrections"
    ON corrections FOR SELECT
    USING (true);

-- Only admins can update corrections
CREATE POLICY "Admins can update corrections"
    ON corrections FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Only admins can delete corrections
CREATE POLICY "Admins can delete corrections"
    ON corrections FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corrections_updated_at
    BEFORE UPDATE ON corrections
    FOR EACH ROW
    EXECUTE FUNCTION update_corrections_updated_at();
