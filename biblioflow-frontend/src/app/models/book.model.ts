// src/app/models/book.model.ts
export interface Book {
  id?: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateBookDto {
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn?: string;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  genre?: string;
  year?: number;
  isbn?: string;
}
