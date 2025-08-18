export class Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    publicationYear: number;
    genre: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Book>) {
        Object.assign(this, partial);
    }
}