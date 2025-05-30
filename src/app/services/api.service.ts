import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { slugify } from './slugify.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/users.model';
import { Credentials } from '../models/credentials.model';
import { AuthResponse } from '../models/auth-response.model';
import { CalendarEvent } from '../models/calendar-event.model';
import { Category } from '../models/categories.model';
import { Product } from '../models/products.model';
import { Customer } from '../models/customers.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://diawd.fr/acbrocante/api/';

  constructor(private http: HttpClient) {}

  // Connexion/inscription
  signUp(data: Omit<User, 'id'> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}users/signup`, data);
  }

  signIn(data: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}users/signin`, data);
  }

  // User
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: number, data: Partial<Omit<User, 'id' | 'email_adress' | 'role'>>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Calendar
  getAllCalendarEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}calendars/`);
  }

  getCalendarEvent(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.baseUrl}calendars/${id}`);
  }

  createCalendarEvent(event: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.baseUrl}calendars/`, event);
  }

  updateCalendarEvent(id: number, event: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.baseUrl}calendars/${id}`, event);
  }

  deleteCalendarEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}calendars/${id}`);
  }

  //Categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}categories/`).pipe(
      map(cats =>
        cats.map(cat => ({
          ...cat,
          slug: slugify(cat.name)
        }))
      )
    );
  }

  getCategoryProducts(categoryId: number) {
  return this.http.get<Product[]>(
    `${this.baseUrl}/categories/${categoryId}/products`
  );
}

  //Products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}products/`);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.baseUrl}categories/${categoryId}/products`
    );
  }

  // Customers
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}customers/`);
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}customers/${id}`);
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}customers/`, customer);
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}customers/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}customers/${id}`);
  }

  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}customers/search?q=${query}`);
  }
}

