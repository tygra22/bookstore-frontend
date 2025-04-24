import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { ApiService } from './api.service';

// Define interfaces for the API responses and query parameters
export interface BookResponse {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface BookSearchParams {
  title?: string;
  author?: string;
  isbn?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Get all books with optional filtering and pagination
   */
  getBooks(params?: BookSearchParams): Observable<BookResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      // Add all params that are defined
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<BookResponse>(
      this.apiService.getBooksUrl(), 
      { params: httpParams }
    );
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(this.apiService.getBooksUrl(id));
  }

  createBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.apiService.getBooksUrl(), book);
  }

  updateBook(id: string, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(this.apiService.getBooksUrl(id), book);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(this.apiService.getBooksUrl(id));
  }

  /**
   * Search books by a text query across multiple fields using the text index
   */
  searchBooks(query: string, page = 1, limit = 20): Observable<BookResponse> {
    // Use a more direct approach with apiService
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    return this.http.get<BookResponse>(
      this.apiService.getBooksUrl(),
      { params }
    );
  }

  /**
   * Get books by genre (formerly category)
   */
  getBooksByGenre(genre: string, page = 1, limit = 20): Observable<BookResponse> {
    // Direct use of apiService with precise URL construction
    const params = new HttpParams()
      .set('genre', genre)
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    return this.http.get<BookResponse>(
      this.apiService.getBooksUrl(),
      { params }
    );
  }

  /**
   * Get books by price range
   */
  getBooksByPriceRange(minPrice: number, maxPrice: number, page = 1, limit = 20): Observable<BookResponse> {
    // Direct URL construction
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    return this.http.get<BookResponse>(
      this.apiService.getBooksUrl(),
      { params }
    );
  }

  /**
   * Get in-stock books (quantity > 0)
   */
  getInStockBooks(page = 1, limit = 20): Observable<BookResponse> {
    // Direct URL construction
    const params = new HttpParams()
      .set('inStock', 'true')
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    return this.http.get<BookResponse>(
      this.apiService.getBooksUrl(),
      { params }
    );
  }

  /**
   * Get books by author
   */
  getBooksByAuthor(author: string, page = 1, limit = 20): Observable<BookResponse> {
    // Direct URL construction
    const params = new HttpParams()
      .set('author', author)
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    return this.http.get<BookResponse>(
      this.apiService.getBooksUrl(),
      { params }
    );
  }
}
