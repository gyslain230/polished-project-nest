
-- Remove the latest user with role="Admin" from the profiles table, keeping only the oldest one
DELETE FROM public.profiles 
WHERE id = (
  SELECT id 
  FROM public.profiles 
  WHERE role = 'Admin' 
  ORDER BY created_at DESC 
  LIMIT 1
) 
AND (
  SELECT COUNT(*) 
  FROM public.profiles 
  WHERE role = 'Admin'
) > 1;
