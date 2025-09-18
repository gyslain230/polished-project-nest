-- Create a secure function to handle admin profile creation
CREATE OR REPLACE FUNCTION public.create_admin_profile(user_id uuid, user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if this is the admin email
  IF user_email = 'gislainrugira@gmail.com' THEN
    -- Insert or update the admin profile
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (user_id, user_email, split_part(user_email, '@', 1), 'Admin')
    ON CONFLICT (id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      name = COALESCE(profiles.name, split_part(user_email, '@', 1)),
      role = 'Admin';
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Add policy to allow admin profile creation
CREATE POLICY "Allow admin profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (email = 'gislainrugira@gmail.com');

CREATE POLICY "Allow admin profile updates" 
ON public.profiles 
FOR UPDATE 
USING (email = 'gislainrugira@gmail.com')
WITH CHECK (email = 'gislainrugira@gmail.com');