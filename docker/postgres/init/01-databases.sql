-- ===== CRÉATION DES BASES DE DONNÉES =====
-- Script d'initialisation PostgreSQL pour BiblioFlow

-- La base principale est créée automatiquement par POSTGRES_DB=biblioflow
-- Ce script s'exécute dans cette base

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schéma principal
CREATE SCHEMA IF NOT EXISTS biblioflow_schema;

-- Log de l'initialisation
SELECT 'PostgreSQL initialized for BiblioFlow' as status;