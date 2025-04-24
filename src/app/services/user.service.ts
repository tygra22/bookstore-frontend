import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Get all users (admin only) with optional filtering and sorting
   */
  getUsers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    sort?: string;
    order?: string;
  }): Observable<{users: User[], pagination: any}> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<{users: User[], pagination: any}>(
      this.apiService.getUrl('users'),
      { params: httpParams }
    );
  }

  /**
   * Get user statistics (admin only)
   */
  getUserStats(): Observable<any> {
    return this.http.get<any>(this.apiService.getUrl('users/stats'));
  }

  /**
   * Get a user by ID (admin only)
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(this.apiService.getUrl(`users/${id}`));
  }

  /**
   * Update user admin status (admin only)
   */
  updateUserAdminStatus(userId: string, isAdmin: boolean): Observable<User> {
    // The AuthInterceptor will automatically add the JWT token
    return this.http.patch<User>(
      this.apiService.getUrl(`users/${userId}/admin-status`),
      { isAdmin }
    );
  }

  /**
   * Delete a user by ID (admin only)
   */
  deleteUser(userId: string): Observable<{message: string}> {
    // The AuthInterceptor will automatically add the JWT token
    return this.http.delete<{message: string}>(
      this.apiService.getUrl(`users/${userId}`)
    );
  }
}
