// src/books/entities/book.entity.ts
export class Book {
    id: number;
    title: string;
    author: string;
    isbn?: string;
    publicationYear?: number;
    genre?: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.author = data.author;
        this.isbn = data.isbn;
        this.genre = data.genre;
        this.available = data.available ?? true;

        // Mapping snake_case vers camelCase
        this.publicationYear = data.publication_year || data.publicationYear;
        this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
        this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
    }
}