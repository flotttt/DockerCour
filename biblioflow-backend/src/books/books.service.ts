// src/books/books.service.ts - VERSION FINALE CORRIGÉE
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService implements OnModuleInit {
    private pool: Pool;

    async onModuleInit() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        try {
            const client = await this.pool.connect();
            console.log('✅ Connexion PostgreSQL établie');
            client.release();
        } catch (error) {
            console.error('❌ Erreur connexion PostgreSQL:', error);
        }
    }

    async findAll(): Promise<Book[]> {
        const query = 'SELECT * FROM books ORDER BY created_at DESC';
        const result = await this.pool.query(query);
        return result.rows.map(row => new Book(row));
    }

    async findOne(id: number): Promise<Book> {
        const query = 'SELECT * FROM books WHERE id = $1';
        const result = await this.pool.query(query, [id]);

        if (result.rows.length === 0) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        return new Book(result.rows[0]);
    }

    async create(createBookDto: any): Promise<Book> {
        try {
            // REQUÊTE CORRIGÉE - Utilise les VRAIS noms de colonnes PostgreSQL
            const query = `
                INSERT INTO books (title, author, isbn, publication_year, genre, description, total_copies, available_copies)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
            `;

            const values = [
                createBookDto.title,
                createBookDto.author,
                createBookDto.isbn || null,
                createBookDto.publicationYear || null,  // camelCase → snake_case
                createBookDto.genre || null,
                createBookDto.description || null,
                createBookDto.totalCopies || 1,         // Nouveau champ
                createBookDto.availableCopies || 1      // Nouveau champ
            ];

            console.log('📝 Insertion livre:', {
                title: values[0],
                author: values[1],
                publication_year: values[3]
            });

            const result = await this.pool.query(query, values);
            console.log('✅ Livre créé avec succès:', result.rows[0].id);

            return new Book(result.rows[0]);
        } catch (error) {
            console.error('❌ Erreur CREATE:', error.message);
            console.error('❌ Détail:', error);
            throw error;
        }
    }

    async update(id: number, updateBookDto: any): Promise<Book> {
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            // Mapping correct des champs
            if (updateBookDto.title !== undefined) {
                fields.push(`title = $${paramIndex}`);
                values.push(updateBookDto.title);
                paramIndex++;
            }
            if (updateBookDto.author !== undefined) {
                fields.push(`author = $${paramIndex}`);
                values.push(updateBookDto.author);
                paramIndex++;
            }
            if (updateBookDto.isbn !== undefined) {
                fields.push(`isbn = $${paramIndex}`);
                values.push(updateBookDto.isbn);
                paramIndex++;
            }
            if (updateBookDto.publicationYear !== undefined) {
                fields.push(`publication_year = $${paramIndex}`);  // ← Mapping correct
                values.push(updateBookDto.publicationYear);
                paramIndex++;
            }
            if (updateBookDto.genre !== undefined) {
                fields.push(`genre = $${paramIndex}`);
                values.push(updateBookDto.genre);
                paramIndex++;
            }
            if (updateBookDto.description !== undefined) {
                fields.push(`description = $${paramIndex}`);
                values.push(updateBookDto.description);
                paramIndex++;
            }
            if (updateBookDto.totalCopies !== undefined) {
                fields.push(`total_copies = $${paramIndex}`);
                values.push(updateBookDto.totalCopies);
                paramIndex++;
            }
            if (updateBookDto.availableCopies !== undefined) {
                fields.push(`available_copies = $${paramIndex}`);
                values.push(updateBookDto.availableCopies);
                paramIndex++;
            }

            if (fields.length === 0) {
                return this.findOne(id);
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const query = `
                UPDATE books
                SET ${fields.join(', ')}
                WHERE id = $${paramIndex}
                    RETURNING *
            `;

            const result = await this.pool.query(query, values);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Book with ID ${id} not found`);
            }

            return new Book(result.rows[0]);
        } catch (error) {
            console.error('❌ Erreur UPDATE:', error.message);
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const query = 'DELETE FROM books WHERE id = $1';
        const result = await this.pool.query(query, [id]);

        if (result.rowCount === 0) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
    }
}