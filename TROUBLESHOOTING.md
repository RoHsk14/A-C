# 🔧 Solution : Email non confirmé

## Problème Identifié

L'erreur **"Email not confirmed"** apparaît lors de la connexion. C'est normal - Supabase requiert par défaut la confirmation d'email.

## Solutions

### Solution 1 : Confirmer l'email manuellement (Recommandé pour le dev)

1. Aller dans votre projet Supabase
2. Cliquer sur **Authentication** dans le menu de gauche
3. Cliquer sur **Users**
4. Trouver l'utilisateur `admin@afrocircle.com`
5. Cliquer sur les **3 points** à droite de l'utilisateur
6. Sélectionner **"Confirm email"**
7. Retourner sur l'application et se connecter

### Solution 2 : Désactiver la confirmation d'email (Pour le développement)

1. Aller dans votre projet Supabase
2. Cliquer sur **Authentication** > **Providers**
3. Cliquer sur **Email** dans la liste des providers
4. Désactiver **"Confirm email"**
5. Cliquer sur **Save**
6. Créer un nouveau compte ou confirmer l'ancien

### Solution 3 : Utiliser SQL pour confirmer (Rapide)

Dans le **SQL Editor** de Supabase, exécuter :

```sql
-- Confirmer l'email de l'utilisateur admin
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@afrocircle.com';
```

### Solution 4 : Créer un admin directement via SQL

```sql
-- Supprimer l'ancien utilisateur si nécessaire
DELETE FROM auth.users WHERE email = 'admin@afrocircle.com';

-- Créer un nouvel utilisateur avec email confirmé
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@afrocircle.com',
  crypt('admin123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Test","phone":"+225 07 12 34 56 78"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Promouvoir en admin
UPDATE profiles 
SET role = 'admin' 
WHERE email IN (
  SELECT email FROM auth.users WHERE email = 'admin@afrocircle.com'
);
```

## Après la confirmation

1. Retourner sur http://localhost:3000/login
2. Se connecter avec :
   - Email: `admin@afrocircle.com`
   - Mot de passe: `admin123456`
3. Vous serez redirigé vers `/dashboard`
4. Accéder à `/admin` pour voir le dashboard administrateur

## Vérification

Pour vérifier que tout fonctionne :

```sql
-- Vérifier l'utilisateur
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@afrocircle.com';

-- Vérifier le profil et le rôle
SELECT id, name, email, role 
FROM profiles 
WHERE email = 'admin@afrocircle.com';
```

---

**Note** : En production, vous devriez toujours garder la confirmation d'email activée pour la sécurité.
