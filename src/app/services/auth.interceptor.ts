import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Get the auth token from local storage
  const currentUser = localStorage.getItem('currentUser');
  
  if (currentUser) {
    try {
      const token = JSON.parse(currentUser).token;
      
      // Clone the request and add the authorization header
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Pass the cloned request instead of the original request
        return next(authReq);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Clear invalid data from localStorage
      localStorage.removeItem('currentUser');
    }
  }
  
  // If no token or error, pass the original request
  return next(req);
};
