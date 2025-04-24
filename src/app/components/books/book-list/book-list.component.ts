import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { SnackbarService } from '../../../services/snackbar.service';

import { Book } from '../../../models/book.model';
import { BookResponse, BookSearchParams, BookService } from '../../../services/book.service';
import { CartService } from '../../../services/cart.service';

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
    MatPaginatorModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  loading = false;
  error = '';

  // Search parameters
  searchQuery: string = '';
  selectedGenre: string = '';
  maxPrice: number | null = null;
  inStockOnly: boolean = false;

  // Pagination
  totalBooks = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Genres list (formerly categories)
  genres: string[] = [];

  // Search debounce subjects
  private searchDebounce: Subject<string> = new Subject<string>();
  private priceDebounce: Subject<number | null> = new Subject<number | null>();

  constructor(
    private bookService: BookService,
    private cartService: CartService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    // Setup search debounce
    this.searchDebounce.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1; // Reset to first page on new search
      this.loadBooks();
    });

    // Setup price debounce
    this.priceDebounce.pipe(
      debounceTime(1000) // 1 second debounce
    ).subscribe(price => {
      this.maxPrice = price;
      this.currentPage = 1; // Reset to first page on price change
      this.loadBooks();
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;

    // Build search parameters
    const params: BookSearchParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add optional search filters
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
          console.error('Error loading books:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Extract unique genres from the loaded books
   * This is a client-side extraction, but ideally we would have an API endpoint 
   * that returns all available genres
   */
  extractGenres(): void {
    const genreSet = new Set<string>();
    this.books.forEach(book => {
      if (book.genre) {
        genreSet.add(book.genre);
      }
    });
    this.genres = Array.from(genreSet).sort();
  }

  /**
   * Handle pagination events
   */
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1; // PageEvent is 0-based, our API is 1-based
    this.loadBooks();
  }

  /**
   * Trigger a search with debounce
   */
  updateSearch(term: string): void {
    this.searchDebounce.next(term);
  }

  /**
   * Update max price with debounce
   */
  updateMaxPrice(price: number | null): void {
    this.priceDebounce.next(price);
  }

  /**
   * Apply genre filter
   */
  filterByGenre(genre: string): void {
    this.selectedGenre = genre;
    this.currentPage = 1; // Reset to first page
    this.loadBooks();
  }

  /**
   * Toggle in-stock filter
   */
  toggleInStock(): void {
    this.inStockOnly = !this.inStockOnly;
    this.currentPage = 1; // Reset to first page
    this.loadBooks();
  }

  /**
   * Clear all filters and reload books
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.maxPrice = null;
    this.inStockOnly = false;
    this.currentPage = 1;
    this.loadBooks();
  }

  /**
   * Add a book to the cart
   */
  addToCart(book: Book): void {
    if (book.quantity === 0) return; // Don't add out of stock books

    this.cartService.addToCart(book);

    // Use our custom SnackbarService with cart-specific styling
    this.snackbarService.cart(`Added ${book.title} to cart`).subscribe(() => {
      // This will automatically navigate to the cart page thanks to the service
    });
  }
}
