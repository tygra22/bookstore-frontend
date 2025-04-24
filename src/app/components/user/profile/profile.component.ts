import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { User } from '../../../models/user.model';
import { Order, OrderSearchParams } from '../../../models/order.model';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTabsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: User | null = null;
  loading = false;
  errorMessage = '';
  passwordHidden = true;
  newPasswordHidden = true;
  confirmPasswordHidden = true;
  
  // Order history properties
  orders: Order[] = [];
  ordersLoading = false;
  ordersError = '';
  ordersPagination = {
    total: 0,
    page: 1,
    pages: 0
  };
  pageSize = 5;
  
  // Table display properties
  displayedColumns: string[] = ['orderId', 'date', 'total', 'status', 'actions'];
  selectedOrder: Order | null = null;
  
  // Tab control
  selectedTabIndex = 0; // Default to profile information tab

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
    this.loadOrders();
    
    // Check for tab parameter in the URL
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'orders') {
        this.selectedTabIndex = 2; // Switch to orders tab (0-based index)
      }
    });
  }

  initForms(): void {
    // Profile form initialization
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      phone: ['', [Validators.pattern(/^[0-9]{10,15}$/)]]
    });

    // Password change form initialization
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUserProfile(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.patchProfileForm(user);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user profile. Please try again.';
        this.loading = false;
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  patchProfileForm(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      address: user.address || '',
      phone: user.phone || ''
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const profileData = this.profileForm.value;

    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.loading = false;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    const passwordData: Partial<User> = {
      // Using type assertion to handle password fields which aren't in User type directly
      password: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    } as Partial<User>;

    this.authService.updateProfile(passwordData).subscribe({
      next: (_) => {
        this.loading = false;
        this.passwordForm.reset();
        this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to update password. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  // Helper methods for form field validation
  getErrorMessage(controlName: string, form: FormGroup = this.profileForm): string {
    const control = form.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['pattern']) {
      if (controlName === 'phone') {
        return 'Please enter a valid phone number (10-15 digits)';
      }
      return 'Invalid format';
    }

    return 'Invalid input';
  }

  getPasswordErrorMessage(controlName: string): string {
    const control = this.passwordForm.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['minlength']) {
      return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
    }

    return '';
  }

  hasPasswordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch') && 
           this.passwordForm.get('confirmPassword')?.touched === true;
  }
  
  // Order history methods
  loadOrders(page: number = 1): void {
    this.ordersLoading = true;
    const params: OrderSearchParams = {
      page: page,
      limit: this.pageSize,
      sort: 'createdAt',
      order: 'desc'
    };
    
    this.orderService.getMyOrders(params).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.ordersPagination = response.pagination;
        this.ordersLoading = false;
      },
      error: (error) => {
        this.ordersError = 'Failed to load orders. Please try again.';
        this.ordersLoading = false;
      }
    });
  }
  
  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders(page);
  }
  

  
  getOrderStatusText(order: Order): string {
    // All orders are now completed immediately for class project simplicity
    return 'Completed';
  }

  getOrderStatusClass(order: Order): string {
    // All orders are now completed/delivered immediately for class project simplicity
    return 'status-delivered';
  }
  
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }
  
  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
  
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Check if a book reference is an object (populated) and not just an ID
   */
  isBookObject(book: any): boolean {
    return book && typeof book === 'object' && !Array.isArray(book);
  }
  
  /**
   * Safely get a property from a book object
   */
  getBookProperty(book: any, property: string): any {
    if (this.isBookObject(book)) {
      return book[property];
    }
    return undefined;
  }
}
