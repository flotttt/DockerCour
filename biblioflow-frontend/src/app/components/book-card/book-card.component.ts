// src/app/components/book-card/book-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.css'],
  standalone: false
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() edit = new EventEmitter<Book>();
  @Output() delete = new EventEmitter<Book>();

  onEdit(): void {
    this.edit.emit(this.book);
  }

  onDelete(): void {
    this.delete.emit(this.book);
  }

  hasIsbn(): boolean {
    return !!this.book.isbn && this.book.isbn.trim().length > 0;
  }

  getFormattedYear(): string {
    return `Publié en ${this.book.year}`;
  }

  getGenreColor(genre: string): string {
    const mapping: Record<string, string> = {
      'Fiction': 'genre-fiction',
      'Non-Fiction': 'genre-non-fiction',
      'Science-Fiction': 'genre-sf',
      'Philosophie': 'genre-philo',
      'Histoire': 'genre-histoire',
      'Biographie': 'genre-bio',
      'Romance': 'genre-romance',
      'Thriller': 'genre-thriller',
      'Mystère': 'genre-mystere',
      'Fantasy': 'genre-fantasy',
      'Horreur': 'genre-horreur',
      'Poésie': 'genre-poesie',
      'Drame': 'genre-drame',
      'Comédie': 'genre-comedie',
    };
    return mapping[genre] || 'genre-default';
  }
}
