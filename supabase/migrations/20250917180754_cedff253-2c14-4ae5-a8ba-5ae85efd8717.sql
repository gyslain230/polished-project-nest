-- Fix the search_path warning by making the function more secure
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
STABLE
SET search_path = public, pg_temp
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
  FROM public.profiles p
  LIMIT 1;
$$;