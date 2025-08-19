// src/books/entities/book.entity.ts - VERSION FINALE
export class Book {
    id: number;
    title: string;
    author: string;
    isbn?: string;
    publicationYear?: number;
    genre?: string;
    description?: string;
    totalCopies: number;
    availableCopies: number;
    available: boolean;  // Computed field
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.author = data.author;
        this.isbn = data.isbn;
        this.genre = data.genre;
        this.description = data.description;

        // Mapping snake_case vers camelCase
        this.publicationYear = data.publication_year || data.publicationYear;
        this.totalCopies = data.total_copies || data.totalCopies || 1;
        this.availableCopies = data.available_copies || data.availableCopies || 1;

        // Computed field : available si availableCopies > 0
        this.available = this.availableCopies > 0;

        this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
        this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
    }
}