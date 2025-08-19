-- ===== DONNÉES DE TEST ET EXEMPLES =====

-- Insertion d'utilisateurs de test
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
                                                                                    ('admin', 'admin@biblioflow.com', crypt('admin123', gen_salt('bf')), 'Admin', 'System', 'admin'),
                                                                                    ('librarian', 'librarian@biblioflow.com', crypt('librarian123', gen_salt('bf')), 'Marie', 'Dupont', 'librarian'),
                                                                                    ('john.doe', 'john.doe@example.com', crypt('password123', gen_salt('bf')), 'John', 'Doe', 'user'),
                                                                                    ('jane.smith', 'jane.smith@example.com', crypt('password123', gen_salt('bf')), 'Jane', 'Smith', 'user'),
                                                                                    ('student', 'student@biblioflow.com', crypt('student123', gen_salt('bf')), 'Étudiant', 'Test', 'user');

-- Insertion de livres de test (supprimer d'abord les anciens si ils existent)
DELETE FROM books;

INSERT INTO books (title, author, isbn, publication_year, genre, description, total_copies, available_copies) VALUES
                                                                                                                  ('Clean Code', 'Robert C. Martin', '978-0132350884', 2008, 'Programming', 'A handbook of agile software craftsmanship', 3, 2),
                                                                                                                  ('The Clean Coder', 'Robert C. Martin', '978-0137081073', 2011, 'Programming', 'A code of conduct for professional programmers', 2, 2),
                                                                                                                  ('Design Patterns', 'Gang of Four', '978-0201633610', 1994, 'Programming', 'Elements of reusable object-oriented software', 2, 1),
                                                                                                                  ('Refactoring', 'Martin Fowler', '978-0134757599', 2018, 'Programming', 'Improving the design of existing code', 2, 2),
                                                                                                                  ('Domain-Driven Design', 'Eric Evans', '978-0321125217', 2003, 'Architecture', 'Tackling complexity in the heart of software', 1, 1),
                                                                                                                  ('The Pragmatic Programmer', 'Andrew Hunt', '978-0201616224', 1999, 'Programming', 'From journeyman to master', 2, 2),
                                                                                                                  ('Microservices Patterns', 'Chris Richardson', '978-1617294549', 2018, 'Architecture', 'With examples in Java', 1, 1),
                                                                                                                  ('Docker Deep Dive', 'Nigel Poulton', '978-1521822807', 2017, 'DevOps', 'Zero to Docker in a single book', 2, 2);

-- Insertion d'emprunts de test
INSERT INTO loans (user_id, book_id, due_date, status) VALUES
                                                           ((SELECT id FROM users WHERE username = 'john.doe'),
                                                            (SELECT id FROM books WHERE isbn = '978-0201633610'),
                                                            CURRENT_TIMESTAMP + INTERVAL '14 days',
                                                            'active'),
                                                           ((SELECT id FROM users WHERE username = 'jane.smith'),
                                                            (SELECT id FROM books WHERE isbn = '978-0132350884'),
                                                            CURRENT_TIMESTAMP + INTERVAL '7 days',
                                                            'active');

-- Mise à jour du nombre de copies disponibles pour les livres empruntés
UPDATE books SET available_copies = available_copies - 1
WHERE id IN (
    SELECT book_id FROM loans WHERE status = 'active'
);

-- Statistiques finales
SELECT
    'Sample data inserted successfully' as status,
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM books) as books_count,
    (SELECT COUNT(*) FROM loans) as loans_count;