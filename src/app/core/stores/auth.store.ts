import { Injectable, signal, computed, effect } from '@angular/core';
import { User, AuthTokens } from '../models/user';

const STORAGE_KEY = 'eventparcel_auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function defaultState(): AuthState {
  return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state = signal<AuthState>(loadState());

  readonly user = computed(() => this.state().user);
  readonly accessToken = computed(() => this.state().accessToken);
  readonly refreshToken = computed(() => this.state().refreshToken);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly userRole = computed<string | null>(() => this.state().user?.role ?? null);
  readonly userName = computed(() => this.state().user?.fullName ?? null);
  readonly userEmail = computed(() => this.state().user?.email ?? null);

  constructor() {
    effect(() => {
      const s = this.state();
      if (s.isAuthenticated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: s.user,
          accessToken: s.accessToken,
          refreshToken: s.refreshToken,
          isAuthenticated: s.isAuthenticated,
        }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  setSession(user: User, tokens: AuthTokens): void {
    this.state.set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  }

  setUser(user: User): void {
    this.state.update(s => ({ ...s, user }));
  }

  setAccessToken(token: string): void {
    this.state.update(s => ({ ...s, accessToken: token }));
  }

  clear(): void {
    this.state.set(defaultState());
  }
}
