-- 1. Confirmer l'email manuellement
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@afrocircle.com';

-- 2. Assurer le profil et le rôle Admin
INSERT INTO public.profiles (id, name, role)
SELECT id, 'Admin AfroCircle', 'admin'
FROM auth.users
WHERE email = 'admin@afrocircle.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Vérification (avec spécification de la table pour éviter l'ambiguïté)
SELECT u.email, u.email_confirmed_at, p.role 
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@afrocircle.com';
