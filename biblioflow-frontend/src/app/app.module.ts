// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookCardComponent } from './components/book-card/book-card.component';

@NgModule({
  declarations: [AppComponent, BookListComponent, BookFormComponent, BookCardComponent],
  imports: [BrowserModule, CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
