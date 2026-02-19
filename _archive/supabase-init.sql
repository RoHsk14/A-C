-- =====================================================
-- AFRO-CIRCLE - Script d'initialisation Supabase
-- =====================================================
-- Ce script crée toutes les tables, relations, politiques RLS
-- et triggers nécessaires pour la plateforme Afro-Circle
-- =====================================================

-- Extension pour UUID (normalement déjà activée sur Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- =====================================================
-- Extension du système auth.users de Supabase
-- Stocke les informations de profil utilisateur
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_profiles_name ON profiles(name);

-- =====================================================
-- TABLE: spaces
-- =====================================================
-- Canaux de discussion thématiques (publics ou privés)
-- =====================================================

CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par slug
CREATE INDEX idx_spaces_slug ON spaces(slug);
CREATE INDEX idx_spaces_created_by ON spaces(created_by);

-- =====================================================
-- TABLE: posts
-- =====================================================
-- Publications (texte/images) dans les espaces
-- =====================================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[], -- Array d'URLs d'images
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_posts_space_id ON posts(space_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- =====================================================
-- TABLE: space_members
-- =====================================================
-- Gestion des membres des espaces privés
-- =====================================================

CREATE TABLE space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utilisateur ne peut être membre qu'une seule fois par espace
  UNIQUE(space_id, user_id)
);

-- Index pour optimiser les vérifications d'accès
CREATE INDEX idx_space_members_space_id ON space_members(space_id);
CREATE INDEX idx_space_members_user_id ON space_members(user_id);

-- =====================================================
-- TABLE: courses
-- =====================================================
-- Catalogue de formations
-- =====================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price_xof INTEGER DEFAULT 0, -- Prix en Francs CFA
  price_usd INTEGER DEFAULT 0, -- Prix en USD (centimes)
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche et filtrage
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_is_published ON courses(is_published);

-- =====================================================
-- TABLE: lessons
-- =====================================================
-- Contenu vidéo et markdown des cours
-- =====================================================

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- URL Mux ou autre provider
  content TEXT, -- Contenu markdown
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER, -- Durée de la vidéo en secondes
  is_preview BOOLEAN DEFAULT FALSE, -- Leçon gratuite/aperçu
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order_index ON lessons(course_id, order_index);

-- =====================================================
-- TABLE: enrollments
-- =====================================================
-- Gestion des accès aux cours (table pivot)
-- =====================================================

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  payment_provider TEXT, -- 'flutterwave', 'paystack', etc.
  payment_reference TEXT, -- Référence de transaction
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = accès permanent
  
  -- Un utilisateur ne peut avoir qu'un seul enrollment actif par cours
  UNIQUE(user_id, course_id)
);

-- Index pour optimiser les vérifications d'accès
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- =====================================================
-- TABLE: completed_lessons
-- =====================================================
-- Suivi des leçons terminées par les utilisateurs
-- =====================================================

CREATE TABLE completed_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utilisateur ne peut marquer une leçon comme terminée qu'une seule fois
  UNIQUE(user_id, lesson_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_completed_lessons_user_id ON completed_lessons(user_id);
CREATE INDEX idx_completed_lessons_lesson_id ON completed_lessons(lesson_id);

-- =====================================================
-- TABLE: comments
-- =====================================================
-- Commentaires sur les leçons et les posts
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un commentaire doit être lié soit à une leçon, soit à un post
  CHECK ((lesson_id IS NOT NULL AND post_id IS NULL) OR (lesson_id IS NULL AND post_id IS NOT NULL))
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_comments_lesson_id ON comments(lesson_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- TABLE: likes
-- =====================================================
-- Likes sur les posts
-- =====================================================

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utilisateur ne peut liker un post qu'une seule fois
  UNIQUE(user_id, post_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- =====================================================
-- TABLE: notifications
-- =====================================================
-- Notifications pour les utilisateurs
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'new_lesson', 'post_like', 'course_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- TRIGGER: Création automatique du profil
-- =====================================================
-- Crée un profil dans la table profiles quand un utilisateur
-- s'inscrit via Supabase Auth
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attacher le trigger à la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FONCTION: Mise à jour automatique de updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger updated_at sur toutes les tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Politiques de sécurité
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- PROFILES: Politiques RLS
-- -----------------------------------------------------

-- Tout le monde peut voir les profils publics
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Les utilisateurs peuvent insérer leur propre profil (via trigger)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------
-- SPACES: Politiques RLS
-- -----------------------------------------------------

-- Les espaces sont visibles si :
-- 1. L'espace est public
-- 2. L'utilisateur est le créateur
-- 3. L'utilisateur est membre (dans space_members)
CREATE POLICY "Spaces are viewable by public or members"
  ON spaces FOR SELECT
  USING (
    is_private = FALSE
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM space_members
      WHERE space_members.space_id = spaces.id
      AND space_members.user_id = auth.uid()
    )
  );

-- Les utilisateurs authentifiés peuvent créer des espaces
CREATE POLICY "Authenticated users can create spaces"
  ON spaces FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Les créateurs peuvent modifier leurs espaces
CREATE POLICY "Creators can update their own spaces"
  ON spaces FOR UPDATE
  USING (created_by = auth.uid());

-- Les créateurs peuvent supprimer leurs espaces
CREATE POLICY "Creators can delete their own spaces"
  ON spaces FOR DELETE
  USING (created_by = auth.uid());

-- -----------------------------------------------------
-- SPACE_MEMBERS: Politiques RLS
-- -----------------------------------------------------

-- Les membres peuvent voir les autres membres du même espace
CREATE POLICY "Members can view other members of their spaces"
  ON space_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = space_members.space_id
      AND (
        spaces.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM space_members sm
          WHERE sm.space_id = spaces.id
          AND sm.user_id = auth.uid()
        )
      )
    )
  );

-- Les admins/créateurs peuvent ajouter des membres
CREATE POLICY "Admins can add members to spaces"
  ON space_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = space_members.space_id
      AND spaces.created_by = auth.uid()
    )
  );

-- Les admins peuvent modifier les rôles
CREATE POLICY "Admins can update member roles"
  ON space_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = space_members.space_id
      AND spaces.created_by = auth.uid()
    )
  );

-- Les admins peuvent retirer des membres
CREATE POLICY "Admins can remove members"
  ON space_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = space_members.space_id
      AND spaces.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------
-- POSTS: Politiques RLS
-- -----------------------------------------------------

-- Les posts sont visibles si :
-- 1. L'espace est public
-- 2. L'utilisateur est le créateur de l'espace
-- 3. L'utilisateur est membre de l'espace privé
CREATE POLICY "Posts are viewable based on space access"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = posts.space_id
      AND (
        spaces.is_private = FALSE
        OR spaces.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM space_members
          WHERE space_members.space_id = spaces.id
          AND space_members.user_id = auth.uid()
        )
      )
    )
  );

-- Les utilisateurs authentifiés peuvent créer des posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

-- Les auteurs peuvent modifier leurs posts
CREATE POLICY "Authors can update their own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid());

-- Les auteurs peuvent supprimer leurs posts
CREATE POLICY "Authors can delete their own posts"
  ON posts FOR DELETE
  USING (author_id = auth.uid());

-- -----------------------------------------------------
-- COURSES: Politiques RLS
-- -----------------------------------------------------

-- Tout le monde peut voir les cours publiés
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (is_published = TRUE OR instructor_id = auth.uid());

-- Les utilisateurs authentifiés peuvent créer des cours
CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND instructor_id = auth.uid());

-- Les instructeurs peuvent modifier leurs cours
CREATE POLICY "Instructors can update their own courses"
  ON courses FOR UPDATE
  USING (instructor_id = auth.uid());

-- Les instructeurs peuvent supprimer leurs cours
CREATE POLICY "Instructors can delete their own courses"
  ON courses FOR DELETE
  USING (instructor_id = auth.uid());

-- -----------------------------------------------------
-- LESSONS: Politiques RLS (PROTECTION CONTENU PAYANT)
-- -----------------------------------------------------

-- Les leçons sont visibles UNIQUEMENT si :
-- 1. C'est une leçon preview (gratuite)
-- 2. L'utilisateur est l'instructeur du cours
-- 3. L'utilisateur a un enrollment actif pour ce cours
CREATE POLICY "Lessons are viewable based on enrollment or preview"
  ON lessons FOR SELECT
  USING (
    is_preview = TRUE
    OR EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = lessons.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
      AND (enrollments.expires_at IS NULL OR enrollments.expires_at > NOW())
    )
  );

-- Les instructeurs peuvent créer des leçons pour leurs cours
CREATE POLICY "Instructors can create lessons for their courses"
  ON lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Les instructeurs peuvent modifier les leçons de leurs cours
CREATE POLICY "Instructors can update lessons for their courses"
  ON lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Les instructeurs peuvent supprimer les leçons de leurs cours
CREATE POLICY "Instructors can delete lessons for their courses"
  ON lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- ENROLLMENTS: Politiques RLS
-- -----------------------------------------------------

-- Les utilisateurs peuvent voir leurs propres enrollments
CREATE POLICY "Users can view their own enrollments"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());

-- Les instructeurs peuvent voir les enrollments de leurs cours
CREATE POLICY "Instructors can view enrollments for their courses"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Les enrollments sont créés via webhook (service_role)
-- Pas de politique INSERT pour les utilisateurs normaux

-- Les utilisateurs peuvent annuler leur propre enrollment
CREATE POLICY "Users can cancel their own enrollment"
  ON enrollments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (status = 'cancelled');

-- -----------------------------------------------------
-- COMPLETED_LESSONS: Politiques RLS
-- -----------------------------------------------------

-- Les utilisateurs peuvent voir leurs propres leçons terminées
CREATE POLICY "Users can view their own completed lessons"
  ON completed_lessons FOR SELECT
  USING (user_id = auth.uid());

-- Les instructeurs peuvent voir les leçons terminées de leurs cours
CREATE POLICY "Instructors can view completed lessons for their courses"
  ON completed_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = completed_lessons.lesson_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent marquer leurs leçons comme terminées
CREATE POLICY "Users can mark lessons as completed"
  ON completed_lessons FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres leçons terminées
CREATE POLICY "Users can delete their own completed lessons"
  ON completed_lessons FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------
-- COMMENTS: Politiques RLS
-- -----------------------------------------------------

-- Les commentaires sont visibles par tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent créer des commentaires
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

-- Les auteurs peuvent modifier leurs commentaires
CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

-- Les auteurs peuvent supprimer leurs commentaires
CREATE POLICY "Authors can delete their own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid());

-- -----------------------------------------------------
-- LIKES: Politiques RLS
-- -----------------------------------------------------

-- Les likes sont visibles par tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view likes"
  ON likes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent liker des posts
CREATE POLICY "Authenticated users can like posts"
  ON likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Les utilisateurs peuvent retirer leurs likes
CREATE POLICY "Users can unlike posts"
  ON likes FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------
-- NOTIFICATIONS: Politiques RLS
-- -----------------------------------------------------

-- Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- DONNÉES DE TEST (Optionnel - à supprimer en prod)
-- =====================================================

-- Créer un espace de test (décommenter si besoin)
-- INSERT INTO spaces (slug, name, description, is_private)
-- VALUES ('general', 'Général', 'Espace de discussion général', FALSE);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Pour vérifier que tout est bien créé :
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
