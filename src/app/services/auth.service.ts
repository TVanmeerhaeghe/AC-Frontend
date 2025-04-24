import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private readonly TOKEN_KEY = 'token';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  
  login(token: string): void {
    this.isAuthenticated = true;
    this.setToken(token);
  }
  
}
