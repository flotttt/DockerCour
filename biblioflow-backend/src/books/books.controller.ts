// src/books/books.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Post()
    async create(@Body() createBookDto: Partial<Book>) {
        const book = await this.booksService.create(createBookDto);
        return {
            message: 'BiblioFlow API - Book created successfully',
            data: book,
            timestamp: new Date().toISOString(),
        };
    }

    @Get()
    async findAll() {
        const books = await this.booksService.findAll();
        return {
            message: 'BiblioFlow API - All books',
            data: books,
            count: books.length,
            timestamp: new Date().toISOString(),
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const book = await this.booksService.findOne(id);
        return {
            message: `BiblioFlow API - Book ${id}`,
            data: book,
            timestamp: new Date().toISOString(),
        };
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateBookDto: Partial<Book>) {
        const book = await this.booksService.update(id, updateBookDto);
        return {
            message: `BiblioFlow API - Book ${id} updated`,
            data: book,
            timestamp: new Date().toISOString(),
        };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.booksService.remove(id);
        return {
            message: `BiblioFlow API - Book ${id} deleted`,
            timestamp: new Date().toISOString(),
        };
    }
}