import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      map(user => {
        // Check if user exists and is an admin
        if (user && user.isAdmin) {
          return true;
        }
        
        // Redirect to books page if not admin
        return this.router.createUrlTree(['/books']);
      })
    );
  }
}
