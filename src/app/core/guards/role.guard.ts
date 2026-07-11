import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);
    const role = store.userRole();

    if (!role) return router.parseUrl('/login');
    if (allowedRoles.includes(role)) return true;

    return router.parseUrl('/dashboard');
  };
}
