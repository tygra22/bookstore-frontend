import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const currentUser = authService.currentUserValue;
  
  if (currentUser) {
    // Check if route is restricted by role
    if (route.data['roles'] && route.data['roles'].indexOf(currentUser.isAdmin ? 'admin' : 'user') === -1) {
      // Role not authorized, redirect to home page
      router.navigate(['/']);
      return false;
    }
    
    // Authorized, return true
    return true;
  }
  
  // Not logged in, redirect to login page with return url
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
