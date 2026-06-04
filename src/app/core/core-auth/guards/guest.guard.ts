import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const role = authService.getRole();

  if (role === 'ADMIN') {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/dashboard-user']);
  }

  return false;
};