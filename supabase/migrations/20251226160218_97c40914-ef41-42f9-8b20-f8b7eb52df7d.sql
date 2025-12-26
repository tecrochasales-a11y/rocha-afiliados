-- Atribuir role admin ao usuário andersonmenez@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'andersonmenez@gmail.com'
ON CONFLICT DO NOTHING;