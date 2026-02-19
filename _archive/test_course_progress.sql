-- =====================================================
-- Script de Test : Progression des Cours
-- =====================================================
-- Ce script permet de marquer des leçons comme complétées pour tester
-- l'affichage de la progression dans l'admin

-- =====================================================
-- ÉTAPE 1 : Identifier vos données
-- =====================================================
-- Remplacez ces valeurs par vos vraies données :

-- 1. Trouvez votre USER_ID
-- SELECT id, email FROM profiles WHERE email = 'votre-email@example.com';

-- 2. Trouvez un COURSE_ID
-- SELECT id, title FROM courses LIMIT 5;

-- 3. Trouvez les LESSON_IDs de ce cours
-- SELECT id, title, order_index FROM lessons WHERE course_id = 'VOTRE_COURSE_ID' ORDER BY order_index;

-- =====================================================
-- ÉTAPE 2 : Marquer des leçons comme complétées
-- =====================================================
-- Exemple : Marquer les 3 premières leçons d'un cours comme complétées

-- Remplacez ces valeurs :
-- USER_ID: L'ID de l'utilisateur
-- LESSON_ID_1, LESSON_ID_2, LESSON_ID_3: Les IDs des leçons

/*
INSERT INTO completed_lessons (user_id, lesson_id, completed_at)
VALUES 
    ('USER_ID', 'LESSON_ID_1', NOW()),
    ('USER_ID', 'LESSON_ID_2', NOW()),
    ('USER_ID', 'LESSON_ID_3', NOW())
ON CONFLICT (user_id, lesson_id) DO NOTHING;
*/

-- =====================================================
-- ÉTAPE 3 : Vérifier la progression
-- =====================================================
-- Cette requête calcule le pourcentage de progression

/*
WITH course_lessons AS (
    SELECT id FROM lessons WHERE course_id = 'VOTRE_COURSE_ID'
),
completed_count AS (
    SELECT COUNT(*) as completed
    FROM completed_lessons
    WHERE user_id = 'USER_ID'
    AND lesson_id IN (SELECT id FROM course_lessons)
),
total_count AS (
    SELECT COUNT(*) as total FROM course_lessons
)
SELECT 
    completed.completed,
    total.total,
    ROUND((completed.completed::numeric / total.total::numeric) * 100) as progress_percentage
FROM completed_count completed, total_count total;
*/

-- =====================================================
-- EXEMPLE COMPLET (À ADAPTER)
-- =====================================================
-- Voici un exemple complet que vous pouvez adapter :

/*
-- 1. Trouvez vos IDs
SELECT 
    p.id as user_id, 
    p.email,
    c.id as course_id,
    c.title as course_title
FROM profiles p
CROSS JOIN courses c
WHERE p.email = 'votre-email@example.com'
LIMIT 1;

-- 2. Trouvez les leçons du cours
SELECT id, title, order_index 
FROM lessons 
WHERE course_id = 'VOTRE_COURSE_ID' 
ORDER BY order_index;

-- 3. Marquez quelques leçons comme complétées
INSERT INTO completed_lessons (user_id, lesson_id, completed_at)
SELECT 
    'USER_ID' as user_id,
    id as lesson_id,
    NOW() as completed_at
FROM lessons
WHERE course_id = 'VOTRE_COURSE_ID'
ORDER BY order_index
LIMIT 3  -- Marque les 3 premières leçons
ON CONFLICT (user_id, lesson_id) DO NOTHING;
*/

-- =====================================================
-- NETTOYAGE (si besoin de recommencer)
-- =====================================================
-- Pour supprimer toutes les leçons complétées d'un utilisateur :
-- DELETE FROM completed_lessons WHERE user_id = 'USER_ID';
