-- Atribuir role de admin ao usuário pelo email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'sales.planos@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;