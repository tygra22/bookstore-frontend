import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { CartService } from '../../../services/cart.service';
import { Cart, CartItem } from '../../../models/cart-item.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit {
  cart: Cart | null = null;
  displayedColumns: string[] = ['image', 'title', 'price', 'quantity', 'total', 'actions'];
  
  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.cart$.subscribe((cart: Cart) => {
      this.cart = cart;
    });
  }
  
  /**
   * Increase item quantity
   */
  increaseQuantity(item: CartItem): void {
    // Check if we're increasing beyond available stock
    if (item.quantity >= item.book.quantity) {
      this.snackBar.open(`Sorry, only ${item.book.quantity} copies available`, 'Close', {
        duration: 3000
      });
      return;
    }
    
    this.cartService.updateQuantity(item.book._id, item.quantity + 1);
    this.showNotification(`Added another copy of ${item.book.title}`);
  }
  
  /**
   * Decrease item quantity
   */
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.book._id, item.quantity - 1);
      this.showNotification(`Removed one copy of ${item.book.title}`);
    } else {
      this.removeFromCart(item);
    }
  }
  
  /**
   * Remove item from cart
   */
  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item.book._id);
    this.showNotification(`Removed ${item.book.title} from cart`);
  }
  
  /**
   * Clear the entire cart
   */
  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
      this.showNotification('Cart cleared');
    }
  }
  
  /**
   * Proceed to checkout
   */
  checkout(): void {
    // Redirect to checkout page if cart is not empty
    if (this.cart && this.cart.items.length > 0) {
      this.router.navigate(['/checkout']);
    } else {
      this.showNotification('Your cart is empty. Add items before checkout.');
    }
  }
  
  /**
   * Show notification using MatSnackBar
   */
  private showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
