import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { AuthService } from '../auth/auth.service';
import { environment } from '@env/environment';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (isAuthRequest(req)) {
    return next(req);
  }

  const token = store.accessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403) && token) {
        return handle401(req, next, store, router, authService);
      }
      return throwError(() => error);
    }),
  );
};

function isAuthRequest(req: HttpRequest<unknown>): boolean {
  const url = req.url.replace(environment.apiUrl, '');
  return url.startsWith('/auth');
}

function handle401(
  req: HttpRequest<unknown>,
  next: import('@angular/common/http').HttpHandlerFn,
  store: AuthStore,
  router: Router,
  authService: AuthService,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(res => {
        isRefreshing = false;
        refreshSubject.next(res.accessToken);
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${res.accessToken}` },
        }));
      }),
      catchError(err => {
        isRefreshing = false;
        refreshSubject.next(null);
        store.clear();
        router.navigate(['/login']);
        return throwError(() => err);
      }),
    );
  }

  return refreshSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => {
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }));
    }),
  );
}
