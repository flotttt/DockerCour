// src/books/entities/book.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('books') // ✅ Décorateur pour créer la table 'books'
export class Book {
    @PrimaryGeneratedColumn() // ✅ Clé primaire auto-incrémentée
    id: number;

    @Column({ type: 'varchar', length: 255 }) // ✅ Colonne obligatoire
    title: string;

    @Column({ type: 'varchar', length: 255 }) // ✅ Colonne obligatoire
    author: string;

    @Column({ type: 'varchar', length: 20, nullable: true }) // ✅ Colonne optionnelle
    isbn?: string;

    @Column({ name: 'publication_year', type: 'int', nullable: true }) // ✅ Mapping snake_case
    publicationYear?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    genre?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'total_copies', type: 'int', default: 1 }) // ✅ Valeur par défaut
    totalCopies: number;

    @Column({ name: 'available_copies', type: 'int', default: 1 })
    availableCopies: number;

    @CreateDateColumn({ name: 'created_at' }) // ✅ Timestamp automatique
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' }) // ✅ Timestamp automatique
    updatedAt: Date;

    // ✅ Getter computed (pas stocké en DB)
    get available(): boolean {
        return this.availableCopies > 0;
    }

    constructor(data?: Partial<Book>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}