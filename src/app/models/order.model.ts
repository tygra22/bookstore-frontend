import { Book } from './book.model';
import { User } from './user.model';

export interface OrderItem {
  book: string | Book; // Book ID or Book object when populated
  title: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface Order {
  _id: string;
  user: string | User; // User ID or User object when populated
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  unpaidOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  // processingOrders field is optional for our class project since all orders are immediately completed
  processingOrders?: number;
  
  // Original nested structure kept for backwards compatibility
  statistics?: {
    totalOrders: number;
    paidOrders: number;
    deliveredOrders: number;
    processingOrders: number;
    revenue: number;
  };
  monthlyTrend?: {
    _id: {
      year: number;
      month: number;
    };
    count: number;
    revenue: number;
  }[];
}

export interface OrderSearchParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: 'paid' | 'unpaid' | 'delivered' | 'processing' | 'completed' | 'pending';
}
