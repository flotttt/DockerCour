import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Post()
    create(@Body() createBookDto: Partial<Book>) {
        return this.booksService.create(createBookDto);
    }

    @Get()
    findAll() {
        return {
            message: 'BiblioFlow API - All books',
            data: this.booksService.findAll(),
            timestamp: new Date().toISOString(),
        };
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return {
            message: `BiblioFlow API - Book ${id}`,
            data: this.booksService.findOne(id),
            timestamp: new Date().toISOString(),
        };
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBookDto: Partial<Book>,
    ) {
        return {
            message: `BiblioFlow API - Book ${id} updated`,
            data: this.booksService.update(id, updateBookDto),
            timestamp: new Date().toISOString(),
        };
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        this.booksService.remove(id);
        return {
            message: `BiblioFlow API - Book ${id} deleted`,
            timestamp: new Date().toISOString(),
        };
    }
}