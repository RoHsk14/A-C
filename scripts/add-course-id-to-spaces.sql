-- ============================================
-- MISE À JOUR DU SCHÉMA : Ajouter course_id à spaces
-- ============================================
-- Exécuter AVANT le script seed-demo-data.sql

-- Ajouter la colonne course_id à la table spaces
ALTER TABLE spaces 
ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_spaces_course_id ON spaces(course_id);

-- Commentaire
COMMENT ON COLUMN spaces.course_id IS 'Référence optionnelle vers un cours pour créer un espace de discussion dédié';
