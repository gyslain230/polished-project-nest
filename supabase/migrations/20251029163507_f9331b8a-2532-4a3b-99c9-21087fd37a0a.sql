-- Delete orphaned profile that doesn't correspond to an auth user
DELETE FROM public.profiles 
WHERE id = 'ffe7b439-7039-4204-a11a-6a7817736dca';

-- Insert admin role for the valid auth user only
INSERT INTO public.user_roles (user_id, role)
VALUES ('b6d14016-1d2f-4f18-89cf-800ac9e21b85', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;