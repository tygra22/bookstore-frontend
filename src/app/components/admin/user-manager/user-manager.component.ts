import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../../models/user.model';
import { SnackbarService } from '../../../services/snackbar.service';
import { UserService } from '../../../services/user.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
  ],
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss']
})
export class UserManagerComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'address', 'phone', 'isAdmin', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  totalUsers = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  currentPage = 1;

  loading = false;
  error = '';
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(page: number = 1): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers({
      page: page,
      limit: this.pageSize,
      search: this.searchTerm,
      sort: this.sort?.active || 'createdAt',
      order: this.sort?.direction || 'desc'
    }).subscribe({
      next: (response) => {
        this.users = response.users;
        this.dataSource.data = this.users;
        this.totalUsers = response.pagination.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadUsers(this.currentPage);
  }

  toggleAdminStatus(user: User): void {
    if (!user._id) return;

    const newStatus = !user.isAdmin;

    this.userService.updateUserAdminStatus(user._id, newStatus).subscribe({
      next: (updatedUser) => {
        // Update the user in the dataSource
        const index = this.users.findIndex(u => u._id === user._id);
        if (index !== -1) {
          this.users[index].isAdmin = newStatus;
          this.dataSource.data = [...this.users]; // Create a new array reference to trigger change detection
        }

        this.snackbarService.success(
          `${user.name} is ${newStatus ? 'now an admin' : 'no longer an admin'}`,
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Error updating user admin status:', error);
        this.snackbarService.error('Failed to update user admin status', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (!user._id) return;

    this.confirmDelete(user);
  }

  confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user._id) {
        this.userService.deleteUser(user._id).subscribe({
          next: () => {
            // Remove the user from the dataSource
            this.users = this.users.filter(u => u._id !== user._id);
            this.dataSource.data = this.users;
            this.totalUsers--;

            this.snackbarService.success(`${user.name} has been deleted`, { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.snackbarService.error('Failed to delete user', { duration: 3000 });
          }
        });
      }
    });
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
