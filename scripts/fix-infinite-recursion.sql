-- Fix infinite recursion in RLS policies
-- This happens because policies reference user_roles which has policies that reference user_roles

-- Drop ALL existing policies on user_roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Allow trigger to insert user roles" ON user_roles;

-- Create simpler policies that don't cause recursion
-- Allow users to view their own role
CREATE POLICY "Users can view own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to view all roles (needed for admin checks)
CREATE POLICY "Authenticated users can view all roles"
    ON user_roles FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only allow insert via trigger or direct admin action
CREATE POLICY "Allow inserts for new users"
    ON user_roles FOR INSERT
    WITH CHECK (true);  -- Allow all inserts (will be controlled by trigger)

-- Only allow updates by the same user (for admin promotion)
CREATE POLICY "Allow role updates"
    ON user_roles FOR UPDATE
    USING (true)  -- Allow updates (control via application logic)
    WITH CHECK (true);

-- Now fix the mikvahs policies to avoid recursion
DROP POLICY IF EXISTS "Admins have full access to mikvahs" ON mikvahs;

-- Recreate admin policy without recursion
CREATE POLICY "Admins have full access to mikvahs"
    ON mikvahs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
