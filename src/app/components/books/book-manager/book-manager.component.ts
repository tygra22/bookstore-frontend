import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { Book } from '../../../models/book.model';
import { BookResponse, BookSearchParams, BookService } from '../../../services/book.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { BookFormDialogComponent } from './book-form-dialog/book-form-dialog.component';

@Component({
  selector: 'app-book-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './book-manager.component.html',
  styleUrl: './book-manager.component.scss'
})
export class BookManagerComponent implements OnInit {
  // Data properties
  books: Book[] = [];
  totalBooks = 0;
  displayedColumns: string[] = ['image', 'title', 'author', 'genre', 'price', 'quantity', 'actions'];
  genres: string[] = [];
  loading = false;
  error: string | null = null;

  // Filter properties
  searchQuery = '';
  selectedGenre = '';
  maxPrice: number | null = null;
  inStockOnly = false;
  currentPage = 1;
  pageSize = 10;

  // View references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Book>;

  constructor(
    private bookService: BookService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    const params: BookSearchParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedGenre) params.genre = this.selectedGenre;
    if (this.maxPrice) params.maxPrice = this.maxPrice;
    if (this.inStockOnly) params.inStock = true;

    this.bookService.getBooks(params)
      .subscribe({
        next: (response: BookResponse) => {
          this.books = response.books;
          this.totalBooks = response.pagination.total;
          this.extractGenres();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load books. Please try again later.';
          this.loading = false;
          this.snackBar.open('Error loading books', 'Close', { duration: 3000 });
        }
      });
  }

  extractGenres(): void {
    // Extract unique genres
    const uniqueGenres = new Set<string>();
    this.books.forEach(book => {
      if (book.genre) uniqueGenres.add(book.genre);
    });
    this.genres = Array.from(uniqueGenres).sort();
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadBooks();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.maxPrice = null;
    this.inStockOnly = false;
    this.currentPage = 1;
    this.loadBooks();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  openBookForm(book?: Book): void {
    const dialogRef = this.dialog.open(BookFormDialogComponent, {
      width: '600px',
      data: book || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result._id) {
          // Update existing book
          this.updateBook(result);
        } else {
          // Create new book
          this.createBook(result);
        }
      }
    });
  }

  createBook(bookData: Partial<Book>): void {
    this.loading = true;
    this.bookService.createBook(bookData).subscribe({
      next: (book) => {
        this.snackBar.open(`Book "${book.title}" created successfully`, 'Close', { duration: 3000 });
        this.loadBooks();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error creating book', 'Close', { duration: 3000 });
      }
    });
  }

  updateBook(bookData: Book): void {
    this.loading = true;
    const id = bookData._id;
    // Remove _id from data being sent
    const { _id, ...bookWithoutId } = bookData;

    this.bookService.updateBook(id, bookWithoutId).subscribe({
      next: (updatedBook) => {
        this.snackBar.open(`Book "${updatedBook.title}" updated successfully`, 'Close', { duration: 3000 });
        this.loadBooks();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error updating book', 'Close', { duration: 3000 });
      }
    });
  }

  confirmDelete(book: Book): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${book.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteBook(book);
      }
    });
  }

  deleteBook(book: Book): void {
    this.loading = true;
    this.bookService.deleteBook(book._id).subscribe({
      next: () => {
        this.snackBar.open(`Book "${book.title}" deleted successfully`, 'Close', { duration: 3000 });
        this.loadBooks();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error deleting book', 'Close', { duration: 3000 });
      }
    });
  }
}
