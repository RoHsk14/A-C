# Afro-Circle 🌍

Plateforme de communauté et de formation optimisée pour le marché africain.

## 🚀 Stack Technologique

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI**: Shadcn/UI (Radix UI), Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Vidéo**: Mux (Streaming HLS adaptatif)
- **Paiement**: Flutterwave / Paystack (Mobile Money)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- (Optionnel) Comptes Flutterwave/Paystack et Mux

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd afro-circle
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Édite `.env.local` et remplis les valeurs :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de ton projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (pour les webhooks)

4. **Initialiser la base de données Supabase**

Va sur ton dashboard Supabase → SQL Editor, puis copie-colle le contenu de `supabase-init.sql` et exécute-le.

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## 📁 Structure du Projet

```
afro-circle/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── lib/
│   ├── supabase/          # Configuration Supabase
│   │   ├── client.ts      # Client browser
│   │   ├── server.ts      # Client server
│   │   └── middleware.ts  # Client middleware
│   └── types/
│       └── database.types.ts  # Types TypeScript
├── middleware.ts          # Middleware Next.js
├── supabase-init.sql      # Script d'initialisation DB
└── .env.local            # Variables d'environnement
```

## 🔒 Sécurité

- **RLS (Row Level Security)** : Toutes les tables sont protégées par des politiques RLS
- **Contenu payant** : Les leçons ne sont accessibles qu'avec un enrollment actif
- **Espaces privés** : Seuls les membres peuvent voir le contenu

## 📚 Prochaines Étapes

1. ✅ Initialiser la base de données
2. ✅ Configurer le projet Next.js
3. 🔄 Créer les composants UI (Shadcn/UI)
4. 🔄 Implémenter l'authentification
5. 🔄 Créer les pages (Spaces, Courses, etc.)
6. 🔄 Intégrer les paiements Mobile Money
7. 🔄 Configurer Mux pour le streaming vidéo

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésite pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT
