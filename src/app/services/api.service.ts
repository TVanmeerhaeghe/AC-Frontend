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
import { Contact } from '../models/contact.model';
import { Estimate } from '../models/estimates.model';
import { Task } from '../models/tasks.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://diawd.fr/acbrocante/api/';
  // local development URL :
  // private baseUrl = 'http://localhost:3000/acbrocante/api/'; 

  constructor(private http: HttpClient) {}

  // Connexion/inscription
  signUp(data: Omit<User, 'id'> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}users/signup`, data);
  }

  signIn(data: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}users/signin`, data);
  }
  
  resetPassword(new_password: string, token: string) {
    return this.http.put(`${this.baseUrl}users/reset-password?token=${token}`, { new_password });
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}users/forgot-password`, { email });
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

    getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}products/${productId}`);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.baseUrl}categories/${categoryId}/products`
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const q = encodeURIComponent(query.trim());
    return this.http.get<Product[]>(`${this.baseUrl}products/search?q=${q}`);
  }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/products/`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  getSoldProductRevenue() {
    return this.http.get<{ period: string, total: number, dates: string[] }[]>(`${this.baseUrl}products/sold-revenue`);
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

  // Invoices
  getAllInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}invoices/`);
  }

  getInvoice(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}invoices/${id}`);
  }

  createInvoice(invoice: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}invoices/`, invoice);
  }

  updateInvoice(id: number, invoice: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}invoices/${id}`, invoice);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}invoices/${id}`);
  }

  searchInvoices(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}invoices/search?q=${encodeURIComponent(query)}`);
  }

  getPaidInvoiceRevenue() {
    return this.http.get<{ period: string, total: number, dates: string[] }[]>(`${this.baseUrl}invoices/paid-revenue`);
  }

  //Contact
  createContact(
    data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'product'>
  ): Observable<Contact> {
    return this.http.post<Contact>(
      `${this.baseUrl}contacts`,
      data
    );
  }

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/contacts`);
  }

  getContactById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/contacts/${id}`);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/contacts/${id}`);
  }

  //Category

  getCategories() {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`);
  }

  getCategory(id: number) {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }

  updateCategory(id: number, data: { name: string; description: string; icon: string; }) {
    return this.http.put(`${this.baseUrl}/categories/${id}`, data);
  }

  createCategory(data: Partial<Category>) {
    return this.http.post<Category>('${this.baseUrl}/categories/', data);
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.baseUrl}/categories/${id}`);
  }

  // Estimates
  getAllEstimates() {
    return this.http.get<Estimate[]>(`${this.baseUrl}estimates/`);
  }

  getEstimate(id: number) {
    return this.http.get<Estimate>(`${this.baseUrl}estimates/${id}`);
  }

  createEstimate(data: Partial<Estimate>) {
    return this.http.post<Estimate>(`${this.baseUrl}estimates/`, data);
  }

  updateEstimate(id: number, data: Partial<Estimate>) {
    return this.http.put<Estimate>(`${this.baseUrl}estimates/${id}`, data);
  }

  deleteEstimate(id: number) {
    return this.http.delete(`${this.baseUrl}estimates/${id}`);
  }

  searchEstimates(query: string) {
    return this.http.get<Estimate[]>(`${this.baseUrl}estimates/search?q=${encodeURIComponent(query)}`);
  }

  // Tasks
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}tasks/`);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}tasks/${id}`);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}tasks/`, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}tasks/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}tasks/${id}`);
  }

  getTvaValues(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}tasks/tva/values`);
  }
}

