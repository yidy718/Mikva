-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE mikvah_type AS ENUM ('men_only', 'separate_hours', 'family');
CREATE TYPE mikvah_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create mikvahs table
CREATE TABLE mikvahs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_he TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone TEXT,
    hours_of_operation JSONB DEFAULT '{}',
    price_info TEXT,
    mikvah_type mikvah_type NOT NULL,
    photos TEXT[] DEFAULT '{}',
    directions_parking TEXT,
    accessibility_info TEXT,
    status mikvah_status DEFAULT 'pending' NOT NULL,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Add spatial index for efficient location queries
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED
);

-- Create user_roles table
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_mikvahs_status ON mikvahs(status);
CREATE INDEX idx_mikvahs_type ON mikvahs(mikvah_type);
CREATE INDEX idx_mikvahs_submitted_by ON mikvahs(submitted_by);
CREATE INDEX idx_mikvahs_location ON mikvahs USING GIST(location);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_mikvahs_updated_at
    BEFORE UPDATE ON mikvahs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE mikvahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mikvahs table

-- Anyone can read approved mikvahs
CREATE POLICY "Anyone can view approved mikvahs"
    ON mikvahs FOR SELECT
    USING (status = 'approved');

-- Authenticated users can view their own submissions (any status)
CREATE POLICY "Users can view own submissions"
    ON mikvahs FOR SELECT
    USING (auth.uid() = submitted_by);

-- Authenticated users can insert new mikvahs (will be pending by default)
CREATE POLICY "Authenticated users can submit mikvahs"
    ON mikvahs FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND submitted_by = auth.uid()
        AND status = 'pending'
    );

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
    ON mikvahs FOR UPDATE
    USING (
        auth.uid() = submitted_by
        AND status = 'pending'
    )
    WITH CHECK (
        auth.uid() = submitted_by
        AND status = 'pending'
    );

-- Admins can do everything
CREATE POLICY "Admins have full access to mikvahs"
    ON mikvahs
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policies for user_roles table

-- Users can view their own role
CREATE POLICY "Users can view own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Admins can update roles
CREATE POLICY "Admins can update roles"
    ON user_roles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
    ON user_roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to automatically create user_role entry on signup
CREATE OR REPLACE FUNCTION create_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_role on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_role();

-- Create storage bucket for mikvah photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('mikvah-photos', 'mikvah-photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view mikvah photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'mikvah-photos');

CREATE POLICY "Authenticated users can upload mikvah photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'mikvah-photos'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update own photos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'mikvah-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'mikvah-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Helper function to search mikvahs within radius
CREATE OR REPLACE FUNCTION search_mikvahs_nearby(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
    id UUID,
    name_en TEXT,
    name_he TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    phone TEXT,
    hours_of_operation JSONB,
    price_info TEXT,
    mikvah_type mikvah_type,
    photos TEXT[],
    directions_parking TEXT,
    accessibility_info TEXT,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.name_en,
        m.name_he,
        m.address,
        m.latitude,
        m.longitude,
        m.phone,
        m.hours_of_operation,
        m.price_info,
        m.mikvah_type,
        m.photos,
        m.directions_parking,
        m.accessibility_info,
        ST_Distance(
            m.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM mikvahs m
    WHERE
        m.status = 'approved'
        AND ST_DWithin(
            m.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql STABLE;
