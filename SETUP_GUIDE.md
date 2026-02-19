# 🚀 Guide de Configuration - Afro-Circle

## Étape 1 : Créer un Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Cliquer sur "New Project"
4. Remplir les informations :
   - **Name** : Afro-Circle
   - **Database Password** : Choisir un mot de passe fort (le noter !)
   - **Region** : Choisir la région la plus proche (ex: Europe West pour l'Afrique)
5. Cliquer sur "Create new project"
6. Attendre 2-3 minutes que le projet soit créé

## Étape 2 : Initialiser la Base de Données

1. Dans votre projet Supabase, aller dans **SQL Editor** (menu de gauche)
2. Cliquer sur "New query"
3. Ouvrir le fichier `supabase-init.sql` de ce projet
4. Copier **tout le contenu** du fichier
5. Coller dans l'éditeur SQL de Supabase
6. Cliquer sur "Run" (ou Ctrl/Cmd + Enter)
7. Vérifier qu'il n'y a pas d'erreurs (vous devriez voir "Success. No rows returned")

## Étape 3 : Récupérer les Clés API

1. Dans Supabase, aller dans **Settings** > **API** (menu de gauche)
2. Vous verrez deux sections importantes :
   - **Project URL** : C'est votre `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** : 
     - `anon` `public` : C'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Étape 4 : Configurer les Variables d'Environnement

1. Ouvrir le fichier `.env.local` dans ce projet
2. Remplacer les valeurs par défaut :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Flutterwave / Paystack Configuration (optionnel pour l'instant)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
FLUTTERWAVE_SECRET_HASH=your-flutterwave-secret-hash

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# Mux Configuration (optionnel pour l'instant)
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
```

3. Sauvegarder le fichier

## Étape 5 : Redémarrer le Serveur

1. Dans le terminal, arrêter le serveur (Ctrl + C)
2. Relancer : `npm run dev`
3. Ouvrir [http://localhost:3000](http://localhost:3000)

## Étape 6 : Créer un Compte Utilisateur

1. Aller sur [http://localhost:3000/register](http://localhost:3000/register)
2. Remplir le formulaire :
   - **Nom** : Votre nom
   - **Email** : Votre email
   - **Téléphone** : Format international (ex: +225 07 XX XX XX XX)
   - **Mot de passe** : Au moins 6 caractères
3. Cliquer sur "S'inscrire"
4. Vous serez redirigé vers `/dashboard`

## Étape 7 : Récupérer votre User ID

### Méthode 1 : Via Supabase Dashboard
1. Dans Supabase, aller dans **Authentication** > **Users**
2. Vous verrez votre utilisateur dans la liste
3. Copier l'**ID** (format UUID : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Méthode 2 : Via SQL Editor
1. Dans Supabase SQL Editor, exécuter :
```sql
SELECT id, name, email FROM profiles ORDER BY created_at DESC LIMIT 1;
```
2. Copier l'ID retourné

## Étape 8 : Promouvoir en Admin

1. Dans Supabase SQL Editor, exécuter :
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'VOTRE-USER-ID-ICI';
```

2. Remplacer `VOTRE-USER-ID-ICI` par l'ID copié à l'étape 7
3. Cliquer sur "Run"
4. Vous devriez voir "Success. 1 row(s) affected"

## Étape 9 : Vérifier l'Accès Admin

1. Rafraîchir la page dans le navigateur
2. Aller sur [http://localhost:3000/admin](http://localhost:3000/admin)
3. Vous devriez voir le dashboard administrateur avec les statistiques

## 🎉 Configuration Terminée !

Votre application est maintenant prête à être utilisée.

### Prochaines Étapes (Optionnel)

#### Configurer Flutterwave (pour les paiements)
1. Créer un compte sur [flutterwave.com](https://flutterwave.com)
2. Aller dans **Settings** > **API**
3. Copier les clés et les ajouter dans `.env.local`
4. Configurer le webhook : `http://localhost:3000/api/webhook/payment` (utiliser ngrok en dev)

#### Configurer Mux (pour les vidéos)
1. Créer un compte sur [mux.com](https://mux.com)
2. Aller dans **Settings** > **Access Tokens**
3. Créer un nouveau token avec permissions "Mux Video"
4. Copier les clés et les ajouter dans `.env.local`

#### Ajouter des Données de Test
1. Dans Supabase SQL Editor, vous pouvez exécuter la section "DONNÉES DE TEST" du fichier `supabase-init.sql`
2. Cela créera des espaces, cours et posts de démonstration

---

**Besoin d'aide ?** Consultez le fichier `PROJECT_STATUS.md` pour plus d'informations.
