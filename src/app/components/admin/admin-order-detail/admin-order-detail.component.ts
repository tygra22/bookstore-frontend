import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Order } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';

interface DialogData {
  orderId: string;
}

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss']
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';
  actionLoading = false;

  constructor(
    private orderService: OrderService,
    public dialogRef: MatDialogRef<AdminOrderDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  // Load full order details
  loadOrderDetails(): void {
    this.loading = true;
    this.error = '';

    this.orderService.getOrderById(this.data.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order details.';
        this.loading = false;
        console.error('Error loading order:', err);
      }
    });
  }

  // Close dialog
  close(refresh = false): void {
    this.dialogRef.close(refresh ? 'refresh' : undefined);
  }

  // Format date for display
  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'N/A';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(undefined, options);
  }

  // Get order status text - all orders are completed for this class project
  getOrderStatusText(): string {
    if (!this.order) return 'Unknown';
    return 'Completed';
  }

  // Get CSS class for status badge - all orders are completed for this class project
  getOrderStatusClass(): string {
    if (!this.order) return '';
    return 'status-delivered';
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  // Helper methods to access nested book properties and user properties safely
  getUserName(user: string | any): string {
    if (!user) return 'N/A';
    if (typeof user === 'string') return 'User: ' + user;
    return user.name || 'N/A';
  }

  getUserEmail(user: string | any): string {
    if (!user) return 'N/A';
    if (typeof user === 'string') return 'ID: ' + user;
    return user.email || 'N/A';
  }

  // Helper methods to access nested book properties safely
  getBookTitle(item: any): string {
    if (!item.book) return 'Unknown Book';
    if (typeof item.book === 'string') return item.title || 'Unknown Book';
    return item.book.title || 'Unknown Book';
  }

  getBookAuthor(item: any): string {
    if (!item.book) return 'Unknown Author';
    if (typeof item.book === 'string') return 'Unknown Author';
    return item.book.author || 'Unknown Author';
  }

  getBookImage(item: any): string {
    if (!item.book) return 'assets/images/book-placeholder.jpg';
    if (typeof item.book === 'string') return 'assets/images/book-placeholder.jpg';
    return item.book.imageUrl || 'assets/images/book-placeholder.jpg';
  }
}
