-- =====================================================
-- Script Généraliste : Progression des Cours
-- =====================================================
-- Ce script marque automatiquement des leçons comme complétées
-- pour TOUS les utilisateurs inscrits à des cours
-- Utile pour peupler des données de test réalistes

-- =====================================================
-- OPTION 1 : Marquer 50% des leçons comme complétées
-- =====================================================
-- Pour chaque inscription (enrollment), marque la moitié des leçons comme complétées

INSERT INTO completed_lessons (user_id, lesson_id, completed_at)
SELECT DISTINCT
    e.user_id,
    l.id as lesson_id,
    NOW() - (RANDOM() * INTERVAL '30 days') as completed_at  -- Date aléatoire dans les 30 derniers jours
FROM enrollments e
INNER JOIN lessons l ON l.course_id = e.course_id
WHERE l.order_index <= (
    -- Prend la moitié des leçons du cours
    SELECT COUNT(*) / 2
    FROM lessons
    WHERE course_id = e.course_id
)
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- =====================================================
-- OPTION 2 : Progression aléatoire (0% à 100%)
-- =====================================================
-- Chaque utilisateur a une progression aléatoire différente

/*
INSERT INTO completed_lessons (user_id, lesson_id, completed_at)
SELECT DISTINCT
    e.user_id,
    l.id as lesson_id,
    NOW() - (RANDOM() * INTERVAL '60 days') as completed_at
FROM enrollments e
INNER JOIN lessons l ON l.course_id = e.course_id
WHERE l.order_index <= (
    -- Pourcentage aléatoire entre 0 et 100%
    SELECT FLOOR(RANDOM() * COUNT(*))
    FROM lessons
    WHERE course_id = e.course_id
)
ON CONFLICT (user_id, lesson_id) DO NOTHING;
*/

-- =====================================================
-- OPTION 3 : Marquer certains cours comme 100% terminés
-- =====================================================
-- Marque TOUTES les leçons comme complétées pour simuler des cours terminés

/*
INSERT INTO completed_lessons (user_id, lesson_id, completed_at)
SELECT DISTINCT
    e.user_id,
    l.id as lesson_id,
    NOW() - (RANDOM() * INTERVAL '90 days') as completed_at
FROM enrollments e
INNER JOIN lessons l ON l.course_id = e.course_id
WHERE RANDOM() < 0.3  -- 30% des inscriptions seront à 100%
ON CONFLICT (user_id, lesson_id) DO NOTHING;
*/

-- =====================================================
-- VÉRIFICATION : Voir la progression de tous les utilisateurs
-- =====================================================
-- Cette requête affiche la progression de chaque utilisateur pour chaque cours

SELECT 
    p.email,
    c.title as course_title,
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT cl.lesson_id) as completed_lessons,
    ROUND((COUNT(DISTINCT cl.lesson_id)::numeric / NULLIF(COUNT(DISTINCT l.id), 0)::numeric) * 100) as progress_percentage
FROM enrollments e
INNER JOIN profiles p ON p.id = e.user_id
INNER JOIN courses c ON c.id = e.course_id
LEFT JOIN lessons l ON l.course_id = e.course_id
LEFT JOIN completed_lessons cl ON cl.lesson_id = l.id AND cl.user_id = e.user_id
GROUP BY p.email, c.title
ORDER BY p.email, c.title;

-- =====================================================
-- NETTOYAGE : Supprimer toutes les progressions
-- =====================================================
-- Attention : Ceci supprime TOUTES les leçons complétées !

-- TRUNCATE completed_lessons;
