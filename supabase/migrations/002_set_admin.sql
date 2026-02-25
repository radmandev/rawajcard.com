-- Set admin role for the primary admin user
-- Run this after the user has signed up / logged in at least once

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'emadradman.dev@gmail.com';

-- If the profile row doesn't exist yet (user hasn't logged in), insert it
-- This will be linked once the user signs in via the upsert in AuthContext
INSERT INTO public.profiles (id, email, role)
SELECT au.id, au.email, 'admin'
FROM auth.users au
WHERE au.email = 'emadradman.dev@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.email = 'emadradman.dev@gmail.com'
  );
