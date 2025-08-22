// src/app/components/book-form/book-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Book, CreateBookDto } from '../../models/book.model';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css'],
  standalone: false
})
export class BookFormComponent implements OnInit {
  @Input() book: Book | null = null;
  @Output() submitted = new EventEmitter<CreateBookDto>();
  @Output() cancelled = new EventEmitter<void>();

  bookForm!: FormGroup;
  isEditing = false;
  maxYear!: number;

  // Liste des genres disponibles
  genres = [
    'Fiction',
    'Non-Fiction',
    'Science-Fiction',
    'Philosophie',
    'Histoire',
    'Biographie',
    'Romance',
    'Thriller',
    'Mystère',
    'Fantasy',
    'Horreur',
    'Poésie',
    'Drame',
    'Comédie'
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.isEditing = !!this.book;
    this.maxYear = new Date().getFullYear() + 10;
    this.initializeForm();
  }

  private isbnValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const raw: string = control.value ?? '';
      if (!raw) return null;
      const sanitized = raw.replace(/[-\s]/g, '').toUpperCase();
      // ISBN-10: 10 chars, last can be X
      const isIsbn10 = /^[0-9]{9}[0-9X]$/.test(sanitized);
      const isIsbn13 = /^[0-9]{13}$/.test(sanitized);
      return isIsbn10 || isIsbn13 ? null : { isbn: true };
    };
  }

  // Initialiser le formulaire
  initializeForm(): void {
    this.bookForm = this.formBuilder.group({
      title: [
        this.book?.title || '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(255)]
      ],
      author: [
        this.book?.author || '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(255)]
      ],
      genre: [
        this.book?.genre || '',
        [Validators.required]
      ],
      year: [
        this.book?.year || new Date().getFullYear(),
        [Validators.required, Validators.min(1000), Validators.max(this.maxYear)]
      ],
      isbn: [
        this.book?.isbn || '',
        [this.isbnValidator()]
      ]
    });
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      const bookData: CreateBookDto = {
        title: formValue.title.trim(),
        author: formValue.author.trim(),
        genre: formValue.genre,
        year: parseInt(formValue.year),
        // garder l'ISBN tel que saisi (tirets acceptés) si présent
        isbn: formValue.isbn?.toString().trim() || undefined
      };

      this.submitted.emit(bookData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${field.errors['maxlength'].requiredLength} caractères`;
      }
      if (field.errors['min']) {
        return `L'année doit être supérieure à ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `L'année ne peut pas être supérieure à ${field.errors['max'].max}`;
      }
      if (field.errors['isbn']) {
        return 'Format ISBN invalide (10 ou 13 chiffres, tirets acceptés)';
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Le titre',
      'author': 'L\'auteur',
      'genre': 'Le genre',
      'year': 'L\'année',
      'isbn': 'L\'ISBN'
    };
    return labels[fieldName] || fieldName;
  }

  getModalTitle(): string {
    return this.isEditing ? 'Modifier le livre' : 'Ajouter un nouveau livre';
  }

  getSubmitButtonText(): string {
    return this.isEditing ? 'Modifier' : 'Ajouter';
  }
}
