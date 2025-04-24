import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../../../../services/snackbar.service';

import { Book } from '../../../../models/book.model';
import { BookService } from '../../../../services/book.service';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss'
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private cartService: CartService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBook(id);
      } else {
        this.error = 'Book ID not provided';
        this.loading = false;
      }
    });
  }

  loadBook(id: string): void {
    this.loading = true;
    this.error = '';

    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading book:', err);
        this.error = 'Failed to load book details. Please try again later.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  addToCart(): void {
    if (!this.book) return;

    this.cartService.addToCart(this.book);
    this.snackbarService.cart(`Added ${this.book.title} to cart`).subscribe(() => {
    });
  }
}
