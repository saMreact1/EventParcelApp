import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';
import {
  LoginRequest, SignupRequest, LoginData, UserInfo,
  ForgotPasswordRequest, ApiResponse, AuthTokens,
} from '../models/user';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(AuthStore);

  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;

  login(data: LoginRequest): Observable<void> {
    return this.http.post<ApiResponse<LoginData>>(`${this.authUrl}/login`, data).pipe(
      tap(res => this.setSession(res.data)),
      map(() => void 0),
    );
  }

  signup(data: SignupRequest): Observable<void> {
    return this.http.post<ApiResponse<UserInfo>>(`${this.authUrl}/register`, data).pipe(
      map(() => void 0),
    );
  }

  logout(): void {
    this.store.clear();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginData> {
    const rt = this.store.refreshToken();
    return this.http.post<ApiResponse<LoginData>>(`${this.authUrl}/refresh`, { refreshToken: rt }).pipe(
      tap(res => this.setSession(res.data)),
      map(res => res.data),
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/forgot-password`, data);
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/reset-password`, { token, newPassword });
  }

  getProfile(): Observable<UserInfo> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.usersUrl}/me`).pipe(
      map(res => res.data),
    );
  }

  private setSession(data: LoginData): void {
    this.store.setSession(data.user, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    });
  }
}
