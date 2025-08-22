// src/app/components/book-list/book-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Book, CreateBookDto } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  standalone: false
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  showAddForm = false;
  editingBook: Book | null = null;

  // Subject pour gérer les désabonnements
  private destroy$ = new Subject<void>();

  // Subject pour la recherche avec debounce
  private searchSubject = new Subject<string>();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Charger tous les livres
  loadBooks(): void {
    this.loading = true;
    this.error = null;

    this.bookService.getBooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          this.books = books;
          this.filteredBooks = books;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Erreur lors du chargement des livres:', error);
        }
      });
  }

  // Configuration de la recherche avec debounce
  setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Attendre 300ms après la dernière saisie
        distinctUntilChanged(), // Ignorer si la valeur n'a pas changé
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterBooks(searchTerm);
      });
  }

  // Gérer la saisie dans la barre de recherche
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  // Filtrer les livres localement
  private filterBooks(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredBooks = this.books;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredBooks = this.books.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.genre.toLowerCase().includes(term) ||
      book.year.toString().includes(term)
    );
  }

  // Ouvrir le formulaire d'ajout
  openAddForm(): void {
    this.showAddForm = true;
    this.editingBook = null;
  }

  // Ouvrir le formulaire de modification
  openEditForm(book: Book): void {
    this.showAddForm = true;
    this.editingBook = book;
  }

  // Fermer le formulaire
  closeForm(): void {
    this.showAddForm = false;
    this.editingBook = null;
  }

  // Gérer la soumission du formulaire
  onFormSubmitted(bookData: CreateBookDto): void {
    if (this.editingBook) {
      // Modification
      this.bookService.updateBook(this.editingBook.id!, bookData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadBooks(); // Recharger la liste
          },
          error: (error) => {
            this.error = error.message;
            console.error('Erreur lors de la modification:', error);
          }
        });
    } else {
      // Ajout
      this.bookService.createBook(bookData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadBooks(); // Recharger la liste
          },
          error: (error) => {
            this.error = error.message;
            console.error('Erreur lors de l\'ajout:', error);
          }
        });
    }
  }

  // Supprimer un livre
  deleteBook(book: Book): void {
    if (!book.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${book.title}" ?`)) {
      this.bookService.deleteBook(book.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadBooks(); // Recharger la liste
          },
          error: (error) => {
            this.error = error.message;
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  // Effacer l'erreur
  clearError(): void {
    this.error = null;
  }

  // Actualiser la liste
  refresh(): void {
    this.searchTerm = '';
    this.loadBooks();
  }

  // Obtenir le nombre total de livres
  getTotalBooksCount(): number {
    return this.books.length;
  }

  // Obtenir le nombre de livres filtrés
  getFilteredBooksCount(): number {
    return this.filteredBooks.length;
  }

  // Fonction de tracking pour ngFor (optimisation)
  trackByBookId(index: number, book: Book): number {
    return book.id || index;
  }
}
