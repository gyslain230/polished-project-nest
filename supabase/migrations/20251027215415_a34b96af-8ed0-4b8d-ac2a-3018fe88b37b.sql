-- Fix ambiguous column reference in create_admin_profile function
-- The issue is that the parameter 'user_id' conflicts with column names
DROP FUNCTION IF EXISTS public.create_admin_profile(uuid, text);

CREATE OR REPLACE FUNCTION public.create_admin_profile(
  p_user_id uuid, 
  p_user_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check if this is the admin email
  IF p_user_email = 'gislainrugira@gmail.com' THEN
    -- Insert or update the admin profile
    INSERT INTO public.profiles (id, email, name, professional_title)
    VALUES (p_user_id, p_user_email, split_part(p_user_email, '@', 1), 'Full Stack Developer')
    ON CONFLICT (id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      name = COALESCE(profiles.name, split_part(p_user_email, '@', 1));
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;