import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://diawd.fr/acbrocante/api';

  constructor(private http: HttpClient) {}

  signUp(data: {
    name: string;
    surname: string;
    password: string;
    role: string;
    email_adress: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/signup`, data);
  }

  signIn(data: {
    email_adress: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/signin`, data);
  }
}