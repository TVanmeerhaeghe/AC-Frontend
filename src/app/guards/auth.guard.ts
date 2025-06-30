import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isLoggedIn();

  if (!isAuth) {
    router.navigate(['/sign-in']);
    return false;
  }

  return true;
};




