import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Order, OrderResponse, OrderSearchParams, OrderStats } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { AdminOrderDetailComponent } from '../admin-order-detail/admin-order-detail.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  // Orders data
  orders: Order[] = [];
  loading = false;
  error = '';

  // Table display properties
  displayedColumns: string[] = ['orderId', 'date', 'customer', 'total', 'status', 'actions'];

  // Search and filtering
  searchTerm = '';
  statusFilter: '' | 'completed' = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Pagination
  pagination = {
    total: 0,
    page: 1,
    pages: 0
  };
  pageSize = 10;

  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Order statistics
  orderStats: OrderStats | null = null;
  statsLoading = false;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.loadOrderStats();
  }

  // Load orders with search, filter, sorting and pagination
  loadOrders(): void {
    this.loading = true;
    this.error = '';

    const params: OrderSearchParams = {
      page: this.pagination.page,
      limit: this.pageSize,
      sort: this.sortField,
      order: this.sortDirection
    };

    // Add filters if set
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.statusFilter) {
      params.status = this.statusFilter;
    }

    if (this.startDate) {
      params.startDate = this.startDate.toISOString();
    }

    if (this.endDate) {
      params.endDate = this.endDate.toISOString();
    }

    console.log('Fetching orders with params:', params);

    this.orderService.getOrders(params).subscribe({
      next: (response: OrderResponse) => {
        console.log('Orders API response:', response);
        this.orders = response.orders || [];
        this.pagination = response.pagination || { total: 0, page: 1, pages: 0 };
        console.log('Processed orders:', this.orders);
        console.log('Pagination:', this.pagination);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  // Load order statistics
  loadOrderStats(): void {
    this.statsLoading = true;
    this.orderService.getOrderStats().subscribe({
      next: (stats) => {
        // Transform the nested stats structure to match our component's flat structure
        if (stats.statistics) {
          this.orderStats = {
            totalOrders: stats.statistics.totalOrders,
            totalRevenue: stats.statistics.revenue,
            paidOrders: stats.statistics.paidOrders,
            unpaidOrders: stats.statistics.totalOrders - stats.statistics.paidOrders,
            deliveredOrders: stats.statistics.deliveredOrders,
            // For this class project, all orders are immediately completed
            completedOrders: stats.statistics.totalOrders,
            // Keep the original structure for backwards compatibility
            statistics: stats.statistics,
            monthlyTrend: stats.monthlyTrend
          };
        } else {
          // Fallback in case the structure is already flat
          this.orderStats = stats;
        }

        console.log('Order stats loaded:', this.orderStats);
        this.statsLoading = false;
      },
      error: (err) => {
        console.error('Error loading order stats:', err);
        this.statsLoading = false;
      }
    });
  }

  // Handle page change
  onPageChange(event: PageEvent): void {
    this.pagination.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  // Handle sort change
  onSortChange(sort: Sort): void {
    this.sortField = sort.active || 'createdAt';
    this.sortDirection = sort.direction || 'desc';
    this.loadOrders();
  }

  // Apply filters
  applyFilters(): void {
    this.pagination.page = 1; // Reset to first page when filtering
    this.loadOrders();
  }

  // Reset filters
  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.startDate = null;
    this.endDate = null;
    this.pagination.page = 1;
    this.loadOrders();
  }

  // Format date for display
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Get order status text - all orders are completed for this class project
  getOrderStatusText(order: Order): string {
    return 'Completed';
  }

  // Get CSS class for status badge - all orders are completed for this class project
  getOrderStatusClass(order: Order): string {
    return 'status-delivered';
  }

  // View order details
  viewOrderDetails(order: Order): void {
    const dialogRef = this.dialog.open(AdminOrderDetailComponent, {
      width: '800px',
      data: { orderId: order._id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadOrders();
        this.loadOrderStats();
      }
    });
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}
