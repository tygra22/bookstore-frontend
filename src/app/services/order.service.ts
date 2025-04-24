import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderResponse, OrderSearchParams, OrderStats } from '../models/order.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Get all orders (admin only)
   */
  getOrders(params?: OrderSearchParams): Observable<OrderResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      // Add all params that are defined
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<OrderResponse>(
      this.apiService.getOrdersUrl(), 
      { params: httpParams }
    );
  }

  /**
   * Get current user's orders
   */
  getMyOrders(params?: OrderSearchParams): Observable<OrderResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      // Add all params that are defined
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<OrderResponse>(
      this.apiService.getOrdersUrl('myorders'), 
      { params: httpParams }
    );
  }

  /**
   * Get order details by ID
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(this.apiService.getOrdersUrl(id));
  }

  /**
   * Create a new order
   */
  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiService.getOrdersUrl(), orderData);
  }

  /**
   * Update order to paid status
   */
  updateOrderToPaid(id: string, paymentResult: any): Observable<Order> {
    return this.http.put<Order>(
      this.apiService.getOrdersUrl(`${id}/pay`),
      paymentResult
    );
  }

  /**
   * Update order to delivered (admin only)
   */
  updateOrderToDelivered(id: string, trackingInfo?: { trackingNumber: string }): Observable<Order> {
    return this.http.put<Order>(
      this.apiService.getOrdersUrl(`${id}/deliver`),
      trackingInfo || {}
    );
  }

  /**
   * Get order statistics (admin only)
   */
  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(this.apiService.getOrdersUrl('stats'));
  }
}
