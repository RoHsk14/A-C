# 🔧 Instructions d'Installation des Données de Démonstration

## ⚠️ Important : Ordre d'Exécution

Les scripts SQL doivent être exécutés dans cet ordre précis :

### 1. Migration du Schéma (OBLIGATOIRE)
**Fichier** : `scripts/add-course-id-to-spaces.sql`

Ce script ajoute la colonne `course_id` à la table `spaces` pour permettre de lier des espaces de discussion à des cours spécifiques.

```sql
-- Copier le contenu de scripts/add-course-id-to-spaces.sql
-- Coller dans Supabase SQL Editor
-- Exécuter
```

### 2. Données de Démonstration
**Fichier** : `scripts/seed-demo-data.sql`

Ce script insère les cours, leçons, espaces et posts de démonstration.

```sql
-- Copier le contenu de scripts/seed-demo-data.sql
-- Coller dans Supabase SQL Editor
-- Exécuter
```

## 📋 Checklist Complète

- [ ] 1. Confirmer l'email admin dans Supabase (voir `TROUBLESHOOTING.md`)
- [ ] 2. Créer le bucket `course-thumbnails` dans Supabase Storage
- [ ] 3. Exécuter `supabase-storage-setup.sql` pour les politiques RLS
- [ ] 4. **Exécuter `scripts/add-course-id-to-spaces.sql`** ← NOUVEAU
- [ ] 5. Exécuter `scripts/seed-demo-data.sql`
- [ ] 6. Se connecter avec admin@afrocircle.com
- [ ] 7. Tester la création de cours sur `/admin/courses/new`

## ✅ Résultat Attendu

Après exécution, vous aurez :
- ✅ 1 espace général
- ✅ 3 cours e-commerce
- ✅ 7 leçons avec contenu Markdown
- ✅ 3 espaces de discussion liés aux cours
- ✅ 10 posts de bienvenue

## 🐛 En Cas d'Erreur

### Erreur : "column course_id does not exist"
→ Vous avez oublié d'exécuter `add-course-id-to-spaces.sql` en premier

### Erreur : "null value in column slug"
→ Déjà corrigé dans la dernière version du script

### Erreur : "column published does not exist"
→ Déjà corrigé (utilise `is_published`)

### Erreur : "instructor_id cannot be null"
→ Assurez-vous d'avoir un utilisateur avec `role = 'admin'` dans la table `profiles`

## 📝 Notes

- Les espaces de cours sont **privés** (seuls les inscrits peuvent y accéder)
- L'espace général est **public** (tous les utilisateurs peuvent y accéder)
- Les 3 premières leçons (une par cours) sont en **preview gratuit**
- Les prix sont en XOF et USD (centimes)
