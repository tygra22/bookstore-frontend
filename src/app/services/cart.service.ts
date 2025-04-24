import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { Cart, CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Default empty cart structure
  private defaultCart: Cart = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    subTotal: 0
  };

  // Use BehaviorSubject to make the cart observable and maintain state
  private cartSubject = new BehaviorSubject<Cart>(this.defaultCart);
  
  // Expose the cart as an observable that components can subscribe to
  cart$: Observable<Cart> = this.cartSubject.asObservable();
  
  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Get current cart state
   */
  getCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Add a book to the cart
   */
  addToCart(book: Book, quantity: number = 1): void {
    const currentCart = this.getCart();
    const existingItemIndex = currentCart.items.findIndex(item => item.book._id === book._id);

    let updatedItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      // Increment quantity of existing item
      updatedItems = [...currentCart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
    } else {
      // Add new item
      updatedItems = [...currentCart.items, { book, quantity }];
    }

    this.updateCart(updatedItems);
  }

  /**
   * Remove a book from the cart
   */
  removeFromCart(bookId: string): void {
    const currentCart = this.getCart();
    const updatedItems = currentCart.items.filter(item => item.book._id !== bookId);
    this.updateCart(updatedItems);
  }

  /**
   * Update quantity of an item in cart
   */
  updateQuantity(bookId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    const currentCart = this.getCart();
    const existingItemIndex = currentCart.items.findIndex(item => item.book._id === bookId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...currentCart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity
      };
      this.updateCart(updatedItems);
    }
  }

  /**
   * Clear the entire cart
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Get number of items in cart
   */
  getItemCount(): number {
    return this.getCart().totalItems;
  }

  /**
   * Update cart with new items and recalculate totals
   */
  private updateCart(items: CartItem[]): void {
    // Calculate totals
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const subTotal = items.reduce((total, item) => total + (item.book.price * item.quantity), 0);
    
    // In a real app, shipping and tax would be calculated differently
    // For this class project, we'll use subTotal as the base for totalPrice
    const totalPrice = subTotal;
    
    // Create updated cart
    const updatedCart: Cart = {
      items,
      totalItems,
      totalPrice,
      subTotal
    };
    
    // Update the cart subject
    this.cartSubject.next(updatedCart);
    
    // Save to localStorage
    this.saveCartToStorage(updatedCart);
  }

  /**
   * Save cart to localStorage for persistence
   */
  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem('bookstore_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  /**
   * Load cart from localStorage on service initialization
   */
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('bookstore_cart');
      if (savedCart) {
        this.cartSubject.next(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }
}
