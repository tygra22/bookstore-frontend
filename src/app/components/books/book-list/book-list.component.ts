import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { Book } from '../../../models/book.model';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  selectedCategory = '';
  categories: string[] = [];

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks()
      .subscribe({
        next: (books) => {
          this.books = books;
          this.filteredBooks = books;
          this.extractCategories();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load books. Please try again later.';
          console.error('Error loading books:', error);
          this.loading = false;
        }
      });
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.books.forEach(book => {
      if (book.category) {
        categorySet.add(book.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  searchBooks(): void {
    if (!this.searchQuery && !this.selectedCategory) {
      this.filteredBooks = this.books;
      return;
    }

    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = !this.searchQuery || 
        book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || book.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filteredBooks = this.books;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.searchBooks();
  }
}
