import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { BookListComponent } from './components/books/book-list/book-list.component';
import { BookDetailsComponent } from './components/books/book-detail/book-details/book-details.component';
import { CartPageComponent } from './components/cart/cart-page/cart-page.component';
import { BookManagerComponent } from './components/books/book-manager/book-manager.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';

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
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: BookManagerComponent },
            // Future admin routes can be added here
            // { path: 'orders', component: OrderManagerComponent },
            // { path: 'users', component: UserManagerComponent },
        ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
