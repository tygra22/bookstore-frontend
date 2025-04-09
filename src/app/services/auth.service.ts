import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/users';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  constructor(private http: HttpClient, private router: Router) {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage to keep user logged in
          const user: User = {
            _id: response._id,
            name: response.name,
            email: response.email,
            isAdmin: response.isAdmin,
            token: response.token
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  register(userData: RegisterData): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage to keep user logged in
          const user: User = {
            _id: response._id,
            name: response.name,
            email: response.email,
            isAdmin: response.isAdmin,
            token: response.token
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, userData)
      .pipe(
        map(response => {
          // Update stored user
          const user: User = {
            _id: response._id,
            name: response.name,
            email: response.email,
            isAdmin: response.isAdmin,
            token: response.token
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  // Helper method to check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
  
  // Helper method to check if user is admin
  isAdmin(): boolean {
    return this.currentUserValue?.isAdmin === true;
  }
}
