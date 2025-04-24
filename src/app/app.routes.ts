import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './components/admin/admin-orders/admin-orders.component';
import { UserManagerComponent } from './components/admin/user-manager/user-manager.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { BookDetailsComponent } from './components/books/book-detail/book-details/book-details.component';
import { BookListComponent } from './components/books/book-list/book-list.component';
import { BookManagerComponent } from './components/books/book-manager/book-manager.component';
import { CartPageComponent } from './components/cart/cart-page/cart-page.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { AdminGuard } from './services/admin.guard';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'books', component: BookListComponent, canActivate: [AuthGuard] },
    { path: 'books/:id', component: BookDetailsComponent, canActivate: [AuthGuard] },
    { path: 'cart', component: CartPageComponent, canActivate: [AuthGuard] },
    { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    {
        path: 'admin',
        canActivate: [AuthGuard, AdminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'books', component: BookManagerComponent },
            { path: 'orders', component: AdminOrdersComponent },
            { path: 'users', component: UserManagerComponent },
            // Future admin routes can be added here
        ]
    },
    { path: '', redirectTo: '/books', pathMatch: 'full' }
];
