-- Remplacez 'votre-email@exemple.com' par votre adresse email de connexion
-- Ce script vous donne le rôle 'admin'

UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'votre-email@exemple.com'
);

-- Vérification
SELECT name, email, role 
FROM profiles 
JOIN auth.users ON profiles.id = auth.users.id
WHERE role = 'admin';
