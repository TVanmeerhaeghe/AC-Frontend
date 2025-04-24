import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Credentials } from '../models/credentials.model';
import { AuthResponse } from '../models/auth-response.model';

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
}
