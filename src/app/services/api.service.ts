import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBaseUrl: string;

  constructor() {
    // Hard-coded production URL to ensure HTTPS is used
    const productionApiUrl = 'https://bookstore-backend-public.up.railway.app/api';
    const developmentApiUrl = 'http://localhost:5000/api';
    
    // Check if we're running on localhost or deployed
    if (window.location.hostname !== 'localhost') {
      // We're in production (deployed)
      this.apiBaseUrl = productionApiUrl;
      console.log('Using production API URL:', this.apiBaseUrl);
    } else {
      // We're in development (localhost)
      this.apiBaseUrl = developmentApiUrl;
      console.log('Using development API URL:', this.apiBaseUrl);
    }
    
    console.log('API service using URL:', this.apiBaseUrl,
      environment.production ? '(Production)' : '(Development)');
  }

  getUrl(endpoint: string): string {
    // Remove leading slash if present
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }
    
    return `${this.apiBaseUrl}/${endpoint}`;
  }

  getUsersUrl(endpoint: string = ''): string {
    return this.getUrl(`users/${endpoint}`);
  }

  getBooksUrl(endpoint: string = ''): string {
    return this.getUrl(`books/${endpoint}`);
  }

  getOrdersUrl(endpoint: string = ''): string {
    return this.getUrl(`orders/${endpoint}`);
  }
}
