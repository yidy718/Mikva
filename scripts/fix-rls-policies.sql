-- Fix the RLS policies to allow the trigger to create user_roles
-- Run this in Supabase SQL Editor

-- First, drop the problematic INSERT policy
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;

-- Create a new policy that allows the trigger function to insert
-- The trigger runs as SECURITY DEFINER so it bypasses RLS, but let's be explicit
CREATE POLICY "Allow trigger to insert user roles"
    ON user_roles FOR INSERT
    WITH CHECK (
        -- Allow if called by trigger (no auth.uid()) OR if user is admin
        auth.uid() IS NULL
        OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Recreate the trigger function to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_role();

CREATE OR REPLACE FUNCTION public.create_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error creating user role: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_role() TO postgres, anon, authenticated, service_role;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_role();
