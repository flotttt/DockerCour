import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
    private books: Book[] = [
        new Book({
            id: 1,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '978-0132350884',
            publicationYear: 2008,
            genre: 'Programming',
            available: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        new Book({
            id: 2,
            title: 'The Pragmatic Programmer',
            author: 'Andrew Hunt',
            isbn: '978-0201616224',
            publicationYear: 1999,
            genre: 'Programming',
            available: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    ];

    private nextId = 3;

    findAll(): Book[] {
        return this.books;
    }

    findOne(id: number): Book {
        const book = this.books.find(book => book.id === id);
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }

    create(createBookDto: Partial<Book>): Book {
        const book = new Book({
            ...createBookDto,
            id: this.nextId++,
            available: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.books.push(book);
        return book;
    }

    update(id: number, updateBookDto: Partial<Book>): Book {
        const bookIndex = this.books.findIndex(book => book.id === id);
        if (bookIndex === -1) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        this.books[bookIndex] = {
            ...this.books[bookIndex],
            ...updateBookDto,
            updatedAt: new Date(),
        };

        return this.books[bookIndex];
    }

    remove(id: number): void {
        const bookIndex = this.books.findIndex(book => book.id === id);
        if (bookIndex === -1) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        this.books.splice(bookIndex, 1);
    }
}