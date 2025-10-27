-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for authorization
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Rename role column to professional_title in profiles
ALTER TABLE public.profiles RENAME COLUMN role TO professional_title;

-- Update the security definer function to check user_roles table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update is_admin function to use has_role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.has_role(user_id, 'admin');
$$;

-- Update create_admin_profile to use user_roles
CREATE OR REPLACE FUNCTION public.create_admin_profile(user_id uuid, user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check if this is the admin email
  IF user_email = 'gislainrugira@gmail.com' THEN
    -- Insert or update the admin profile
    INSERT INTO public.profiles (id, email, name, professional_title)
    VALUES (user_id, user_email, split_part(user_email, '@', 1), 'Full Stack Developer')
    ON CONFLICT (id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      name = COALESCE(profiles.name, split_part(user_email, '@', 1));
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Drop and recreate get_public_profile_data to use professional_title
DROP FUNCTION IF EXISTS public.get_public_profile_data();

CREATE FUNCTION public.get_public_profile_data()
RETURNS TABLE(
  id uuid, 
  name text, 
  professional_title text, 
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
STABLE 
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    p.id,
    p.name,
    p.professional_title,
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
  ORDER BY p.created_at ASC
  LIMIT 1;
$$;