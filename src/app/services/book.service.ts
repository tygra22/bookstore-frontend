import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiService.getBooksUrl());
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

  searchBooks(query: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiService.getBooksUrl('search')}?q=${query}`);
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiService.getBooksUrl(`category/${category}`));
  }
}
