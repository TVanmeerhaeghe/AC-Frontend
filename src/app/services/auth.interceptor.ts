import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  console.log('Token utilisé pour les requêtes :', token);  

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
