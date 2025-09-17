-- Create a function to get public profile data (excluding email)
CREATE OR REPLACE FUNCTION public.get_public_profile_data()
RETURNS TABLE (
  id uuid,
  name text,
  role text,
  profile_image text,
  bio text,
  location text,
  github text,
  linkedin text,
  twitter text,
  skills text[],
  skill_percentages jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.role,
    p.profile_image,
    p.bio,
    p.location,
    p.github,
    p.linkedin,
    p.twitter,
    p.skills,
    p.skill_percentages,
    p.created_at,
    p.updated_at
  FROM public.profiles p;
$$;

-- Remove the public read policies that expose email
DROP POLICY IF EXISTS "Public read access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Create restrictive policy for direct table access (admin only)
CREATE POLICY "Admin can access all profile data" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Keep existing admin policies for full CRUD operations
-- (These were already there and are fine)