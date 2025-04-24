export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string; // Changed from category to match backend
  price: number;
  quantity: number; // Changed from stock to match backend
  description?: string;
  publishDate?: Date; // Renamed from publishedDate to match backend
  publisher?: string;
  imageUrl?: string; // Changed from coverImage to match backend
  isUpcoming?: boolean; // Added to match backend
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  lowStock?: boolean; // Added for dashboard to find low stock books
}
