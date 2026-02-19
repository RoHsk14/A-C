# 🚀 Guide de Déploiement - Admin Power Management

## Étapes Requises

Tous les fichiers sont créés, mais vous devez effectuer ces 2 actions pour voir les changements :

---

### 1️⃣ Exécuter la Migration SQL

**Fichier**: `migration_admin_power.sql`

**Comment faire**:
1. Ouvrir Supabase Dashboard
2. Aller dans **SQL Editor**
3. Copier tout le contenu de `migration_admin_power.sql`
4. Coller dans l'éditeur SQL
5. Cliquer sur **Run**

**Ce que ça fait**:
- Crée la table `audit_logs` (historique des actions admin)
- Crée la table `post_reports` (signalements de contenu)
- Configure les RLS policies
- Ajoute un trigger automatique pour logger les changements de rôle

---

### 2️⃣ Redémarrer le Serveur Next.js

**Dans le terminal**:
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

**Pourquoi**: Next.js doit recharger les nouveaux fichiers et routes.

---

## ✅ Vérification

Après ces 2 étapes, vous devriez voir :

1. **Nouvelle navigation admin** avec 5 liens :
   - Vue d'ensemble
   - Utilisateurs
   - **Cours** (nouveau)
   - **Modération** (nouveau)
   - **Logs** (nouveau)

2. **Nouvelles routes accessibles** :
   - `/admin/courses` - Liste des cours
   - `/admin/moderation` - File de modération
   - `/admin/logs` - Historique des actions
   - `/admin/users/[id]` - Profil utilisateur détaillé

---

## 📂 Fichiers Créés (Déjà en Place)

✅ **Database**:
- `migration_admin_power.sql`

✅ **Backend**:
- `app/admin/actions.ts` (étendu avec 7 nouvelles fonctions)

✅ **Pages**:
- `app/admin/users/[id]/page.tsx`
- `app/admin/courses/page.tsx`
- `app/admin/moderation/page.tsx`
- `app/admin/logs/page.tsx`

✅ **Components**:
- `components/admin/moderation-queue.tsx`
- `components/ui/progress.tsx`
- `components/ui/textarea.tsx`

✅ **Layout**:
- `app/admin/layout.tsx` (mis à jour)

---

## 🐛 Si Ça Ne Marche Toujours Pas

1. **Vider le cache Next.js**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Vérifier les erreurs dans la console** du navigateur

3. **Vérifier que vous êtes admin**:
   - Aller dans Supabase → Table Editor → `profiles`
   - Trouver votre utilisateur
   - Vérifier que `role = 'admin'`

---

## 🎯 Test Rapide

1. Aller sur `/admin`
2. Cliquer sur **"Cours"** dans la sidebar
3. Vous devriez voir la liste des cours
4. Cliquer sur **"Logs"**
5. Vous devriez voir la page des logs (vide pour l'instant)

---

**Besoin d'aide ?** Faites-moi savoir si vous rencontrez une erreur spécifique ! 🚀
