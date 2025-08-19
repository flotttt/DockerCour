-- docker/postgres/init/01-init-biblioflow.sql
-- Script unique d'initialisation complète

-- Création de la base biblioflow (si pas de POSTGRES_DB)
SELECT 'CREATE DATABASE biblioflow' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'biblioflow')\gexec

-- Connexion à la base biblioflow
    \c biblioflow;

-- Table books
CREATE TABLE IF NOT EXISTS books (
                                     id SERIAL PRIMARY KEY,
                                     title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    publication_year INTEGER,
    genre VARCHAR(50),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Données de test
INSERT INTO books (title, author, isbn, publication_year, genre) VALUES
                                                                     ('Clean Code', 'Robert C. Martin', '978-0132350884', 2008, 'Programming'),
                                                                     ('The Pragmatic Programmer', 'Andrew Hunt', '978-0201616224', 1999, 'Programming'),
                                                                     ('Design Patterns', 'Gang of Four', '978-0201633610', 1994, 'Programming'),
                                                                     ('Refactoring', 'Martin Fowler', '978-0134757599', 2018, 'Programming'),
                                                                     ('Domain-Driven Design', 'Eric Evans', '978-0321125217', 2003, 'Architecture');

-- Logs de vérification
SELECT 'BiblioFlow database initialized successfully!' as status;
SELECT 'Books table created with ' || COUNT(*) || ' records' as books_status FROM books;