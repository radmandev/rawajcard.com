-- Migration 004: Admin read/update policies for profiles
-- Allows hardcoded admin emails to read and update all user profiles

-- Drop existing policies if they already exist (safe to re-run)
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;

-- Allow admins to read all profiles (for the admin panel clients section)
CREATE POLICY "profiles_admin_read_all" ON public.profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN ('emadradman.dev@gmail.com', 'admin@rawajcard.com')
  );

-- Allow admins to update any profile (for deactivation / role management)
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN ('emadradman.dev@gmail.com', 'admin@rawajcard.com')
  ) WITH CHECK (
    auth.jwt() ->> 'email' IN ('emadradman.dev@gmail.com', 'admin@rawajcard.com')
  );
