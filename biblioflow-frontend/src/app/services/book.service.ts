// src/app/services/book.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Book, CreateBookDto, UpdateBookDto } from '../models/book.model';

interface ApiListResponse<T> {
  message: string;
  data: T[];
  count?: number;
  timestamp?: string;
}

interface ApiItemResponse<T> {
  message: string;
  data: T;
  timestamp?: string;
}

// Backend raw shape
interface BackendBook {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  genre?: string | null;
  description?: string | null;
  publication_year?: number | null;
  total_copies?: number;
  available_copies?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = '/api/books';

  private booksSubject = new BehaviorSubject<Book[]>([]);
  public books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {}

  private mapBackendToBook(b: BackendBook): Book {
    return {
      id: b.id,
      title: b.title,
      author: b.author,
      genre: b.genre ?? '',
      year: b.publication_year ?? NaN,
      isbn: b.isbn,
      createdAt: b.created_at ? new Date(b.created_at) : undefined,
      updatedAt: b.updated_at ? new Date(b.updated_at) : undefined,
    };
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<ApiListResponse<BackendBook>>(this.apiUrl)
      .pipe(
        map((resp) => (resp.data ?? []).map(this.mapBackendToBook.bind(this))),
        tap(books => this.booksSubject.next(books)),
        catchError(this.handleError)
      );
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<ApiItemResponse<BackendBook>>(`${this.apiUrl}/${id}`)
      .pipe(map(resp => this.mapBackendToBook(resp.data)), catchError(this.handleError));
  }

  createBook(bookData: CreateBookDto): Observable<Book> {
    return this.http.post<ApiItemResponse<BackendBook>>(this.apiUrl, bookData)
      .pipe(
        map(resp => this.mapBackendToBook(resp.data)),
        tap(newBook => {
          const currentBooks = this.booksSubject.value;
          this.booksSubject.next([...currentBooks, newBook]);
        }),
        catchError(this.handleError)
      );
  }

  updateBook(id: number, bookData: UpdateBookDto): Observable<Book> {
    return this.http.patch<ApiItemResponse<BackendBook>>(`${this.apiUrl}/${id}`, bookData) // ← Change PUT en PATCH
      .pipe(
        map(resp => this.mapBackendToBook(resp.data)),
        tap(updatedBook => {
          const currentBooks = this.booksSubject.value;
          const updatedBooks = currentBooks.map(book =>
            book.id === id ? updatedBook : book
          );
          this.booksSubject.next(updatedBooks);
        }),
        catchError(this.handleError)
      );
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<ApiItemResponse<BackendBook>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentBooks = this.booksSubject.value;
          const filteredBooks = currentBooks.filter(book => book.id !== id);
          this.booksSubject.next(filteredBooks);
        }),
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  searchBooks(query: string): Observable<Book[]> {
    return this.http.get<ApiListResponse<BackendBook>>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`)
      .pipe(map(resp => (resp.data ?? []).map(this.mapBackendToBook.bind(this))), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser && error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de joindre le serveur';
          break;
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 404:
          errorMessage = 'Livre non trouvé';
          break;
        case 500:
          errorMessage = 'Erreur serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    console.error('Erreur API:', error);
    return throwError(() => new Error(errorMessage));
  }

  getCurrentBooks(): Book[] {
    return this.booksSubject.value;
  }
}
