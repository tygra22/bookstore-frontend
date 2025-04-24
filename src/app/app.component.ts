import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { User } from './models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Bookstore Management';
  currentUser: User | null = null;
  cartItemCount = 0;
  private cartSubscription: Subscription | null = null;
  
  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    // Subscribe to cart changes to update the badge count
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  get isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }
}
