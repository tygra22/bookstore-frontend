import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { OrderService } from '../../../services/order.service';
import { OrderStats } from '../../../models/order.model';
import { BookService } from '../../../services/book.service';
import { Book, BookSearchParams } from '../../../models/book.model';
import { UserService } from '../../../services/user.service';
import { ApiService } from '../../../services/api.service';

// Import Chart.js directly using script tags in index.html
declare var Chart: any;

interface TopSellingBook {
  _id: string;
  title: string;
  author: string;
  totalSold: number;
  revenue: number;
  imageUrl: string;
}

interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  // Loading states
  orderStatsLoading = true;
  bookStatsLoading = true;
  userStatsLoading = true;
  
  // Stats data
  orderStats: OrderStats | null = null;
  lowStockBooks: Book[] = [];
  topSellingBooks: TopSellingBook[] = [];
  userStats: UserStats = { totalUsers: 0, newUsersThisMonth: 0 };
  
  // Charts
  revenueChart: any;
  salesChart: any;
  
  // Chart data
  monthlyRevenueData: number[] = [];
  monthlySalesData: number[] = [];
  monthLabels: string[] = [];
  
  // Properties to track inventory alerts
  lowStockCount = 0;
  criticalStockCount = 0;
  outOfStockCount = 0;
  
  constructor(
    private orderService: OrderService,
    private bookService: BookService,
    private userService: UserService,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadOrderStats();
    this.loadBookStats();
    this.loadUserStats();
  }
  
  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  // Load all dashboard statistics from the new admin stats endpoint
  loadOrderStats(): void {
    this.orderStatsLoading = true;
    
    // Use the new comprehensive admin stats endpoint
    this.http.get<any>(`${this.apiService.getUrl('admin/stats')}`).subscribe({
      next: (dashboardStats) => {
        console.log('Dashboard stats loaded:', dashboardStats);
        
        // Set order stats
        this.orderStats = {
          totalOrders: dashboardStats.orders.total,
          totalRevenue: dashboardStats.orders.revenue,
          // For this class project, all orders are immediately completed
          completedOrders: dashboardStats.orders.total,
          paidOrders: dashboardStats.orders.total,
          unpaidOrders: 0,
          deliveredOrders: dashboardStats.orders.total,
          // Save monthly trend for charts
          monthlyTrend: dashboardStats.orders.monthlyTrend
        };
        
        // Set the book stats for low stock items
        this.lowStockCount = dashboardStats.books.lowStock;
        
        // Set user stats
        this.userStats = {
          totalUsers: dashboardStats.users.total,
          newUsersThisMonth: dashboardStats.users.newThisMonth
        };
        
        this.processChartData();
        this.orderStatsLoading = false;
      },
      error: (err) => {
        console.error('Error loading admin stats:', err);
        this.orderStatsLoading = false;
        
        // Fallback to original method if new endpoint fails
        this.loadOrderStatsFallback();
      }
    });
  }
  
  // Fallback to original method if new endpoint fails
  loadOrderStatsFallback(): void {
    console.log('Using fallback method for order stats');
    this.orderService.getOrderStats().subscribe({
      next: (stats) => {
        // Transform the nested stats structure if needed
        if (stats.statistics) {
          this.orderStats = {
            totalOrders: stats.statistics.totalOrders,
            totalRevenue: stats.statistics.revenue,
            paidOrders: stats.statistics.paidOrders,
            unpaidOrders: stats.statistics.totalOrders - stats.statistics.paidOrders,
            deliveredOrders: stats.statistics.deliveredOrders,
            completedOrders: stats.statistics.totalOrders,
            statistics: stats.statistics,
            monthlyTrend: stats.monthlyTrend
          };
        } else {
          this.orderStats = stats;
        }
        
        this.processChartData();
        this.orderStatsLoading = false;
      },
      error: (err) => {
        console.error('Error loading order stats:', err);
        this.orderStatsLoading = false;
      }
    });
  }
  
  // Load book statistics including low stock books and top sellers
  loadBookStats(): void {
    this.bookStatsLoading = true;
    
    // Use the dedicated low-stock endpoint
    this.http.get<any>(`${this.apiService.getUrl('admin/low-stock')}`).subscribe({
      next: (response) => {
        console.log('Low stock books loaded:', response);
        this.lowStockBooks = response.books;
        
        // Update stock count metrics
        this.lowStockCount = response.counts.lowStock;
        this.criticalStockCount = response.counts.criticalStock;
        this.outOfStockCount = response.counts.outOfStock;
        
        this.bookStatsLoading = false;
      },
      error: (err) => {
        console.error('Error loading low stock books:', err);
        this.bookStatsLoading = false;
        
        // Fallback to original method if endpoint fails
        this.loadLowStockBooksFallback();
      }
    });
    

  
    // Get top selling books from new API endpoint
    this.http.get<any[]>(`${this.apiService.getUrl('admin/top-books')}`).subscribe({
      next: (topBooks) => {
        console.log('Top selling books loaded:', topBooks);
        this.topSellingBooks = topBooks;
      },
      error: (err) => {
        console.error('Error loading top selling books:', err);
        // Don't use simulated data, just set empty array when API fails
        this.topSellingBooks = [];
      }
    });
  }
  
  // Fallback method for loading low stock books
  loadLowStockBooksFallback(): void {
    console.log('Using fallback method for low stock books');
    this.bookService.getBooks({ limit: 10 } as BookSearchParams).subscribe({
      next: (response) => {
        // Filter books with low stock (less than 10 units)
        this.lowStockBooks = response.books.filter(book => book.quantity < 10);
        
        // Manually calculate counts
        this.lowStockCount = this.lowStockBooks.length;
        this.criticalStockCount = this.lowStockBooks.filter(book => book.quantity < 5).length;
        this.outOfStockCount = this.lowStockBooks.filter(book => book.quantity === 0).length;
        
        console.log('Fallback low stock books loaded:', this.lowStockBooks);
      },
      error: (err) => {
        console.error('Fallback for low stock books also failed:', err);
        this.lowStockBooks = [];
        this.lowStockCount = 0;
        this.criticalStockCount = 0;
        this.outOfStockCount = 0;
      }
    });
  }
  
  // Get detailed user statistics
  loadUserStats(): void {
    this.userStatsLoading = true;
    
    // Use the dedicated user stats endpoint for more detailed information
    this.http.get<any>(`${this.apiService.getUrl('admin/user-stats')}`).subscribe({
      next: (stats) => {
        console.log('Detailed user stats loaded:', stats);
        
        this.userStats = {
          totalUsers: stats.totalUsers,
          newUsersThisMonth: stats.usersThisMonth
        };
        
        // Could add more detailed user stats if needed for the dashboard
        
        this.userStatsLoading = false;
      },
      error: (err) => {
        console.error('Error loading detailed user stats:', err);
        this.userStatsLoading = false;
        
        // Fallback to simpler method if detailed stats fail
        this.userService.getUsers({ limit: 1 }).subscribe({
          next: (response) => {
            const totalUsers = response.pagination.total || 0;
            this.userStats = {
              totalUsers,
              newUsersThisMonth: 0 // Without specific API data, we don't know
            };
            this.userStatsLoading = false;
          },
          error: (secondErr) => {
            console.error('Fallback user stats also failed:', secondErr);
            this.userStatsLoading = false;
            this.userStats = { totalUsers: 0, newUsersThisMonth: 0 };
          }
        });
      }
    });
  }
  
  // Process chart data from order stats
  processChartData(): void {
    if (this.orderStats?.monthlyTrend) {
      // Clear previous data
      this.monthLabels = [];
      this.monthlyRevenueData = [];
      this.monthlySalesData = [];
      
      // Sort by date
      const sortedTrend = [...this.orderStats.monthlyTrend].sort((a, b) => {
        if (a._id.year !== b._id.year) {
          return a._id.year - b._id.year;
        }
        return a._id.month - b._id.month;
      });
      
      // Extract last 6 months data (or less if not enough data)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trend = sortedTrend.slice(-6); // Last 6 months
      
      trend.forEach(month => {
        this.monthLabels.push(`${months[month._id.month - 1]} ${month._id.year}`);
        this.monthlyRevenueData.push(month.revenue);
        this.monthlySalesData.push(month.count);
      });
      
      this.initCharts();
    }
  }
  
  // Initialize charts once data is loaded
  initCharts(): void {
    setTimeout(() => {
      this.createRevenueChart();
      this.createSalesChart();
    }, 0);
  }
  
  // Create revenue chart
  createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthLabels,
        datasets: [{
          label: 'Monthly Revenue',
          data: this.monthlyRevenueData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return '$' + context.parsed.y.toFixed(2);
              }
            }
          }
        }
      }
    });
  }
  
  // Create sales count chart
  createSalesChart(): void {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    
    this.salesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthLabels,
        datasets: [{
          label: 'Orders per Month',
          data: this.monthlySalesData,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  // Format currency
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
  

}
