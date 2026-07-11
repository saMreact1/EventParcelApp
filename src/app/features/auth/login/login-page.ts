import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary lg:hidden">
          <span class="text-lg font-bold text-white">EP</span>
        </div>
        <h1 class="heading-3 text-text-primary">Welcome back</h1>
        <p class="body-base text-text-secondary mt-2">
          Sign in to your Event Parcel account
        </p>
      </div>

      <!-- Error Alert -->
      @if (errorMessage(); as msg) {
        <div class="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3">
          <svg class="h-5 w-5 flex-shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="body-small text-error">{{ msg }}</p>
        </div>
      }

      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="email" class="body-small font-medium text-text-primary block mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="block w-full rounded-lg border border-border bg-card px-4 py-2.5 body-base text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            [class.border-error]="emailField?.invalid && emailField?.touched"
            autocomplete="email"
          />
          @if (emailField?.invalid && emailField?.touched) {
            <p class="body-xs text-error mt-1">
              @if (emailField?.errors?.['required']) { Email is required }
              @if (emailField?.errors?.['email']) { Please enter a valid email }
            </p>
          }
        </div>

        <div>
          <label for="password" class="body-small font-medium text-text-primary block mb-1.5">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="Enter your password"
              class="block w-full rounded-lg border border-border bg-card px-4 py-2.5 pr-10 body-base text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              [class.border-error]="passwordField?.invalid && passwordField?.touched"
              autocomplete="current-password"
            />
            <button type="button"
                    (click)="togglePassword()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
              @if (showPassword()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              }
            </button>
          </div>
          @if (passwordField?.invalid && passwordField?.touched) {
            <p class="body-xs text-error mt-1">Password is required</p>
          }
        </div>

        <div class="flex items-center justify-between">
          <a routerLink="/forgot-password" class="body-small font-medium text-primary no-underline hover:text-primary-light transition-colors">
            Forgot password?
          </a>
        </div>

        <button type="submit"
                [disabled]="loginForm.invalid || isSubmitting()"
                class="w-full rounded-lg bg-primary px-4 py-2.5 body-base font-semibold text-text-inverse transition-all hover:bg-primary-light active:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">
          @if (isSubmitting()) {
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in...
            </span>
          } @else {
            Sign in with email
          }
        </button>
      </form>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center body-xs text-text-muted">
          <span class="bg-card px-2">Or login with</span>
        </div>
      </div>

      <!-- Google Login -->
      <a href="https://api.eventparcel.com/api/v1/auth/google"
         class="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 body-base font-medium text-text-primary no-underline transition-all hover:bg-surface-alt active:bg-surface">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </a>

      <!-- Sign up link -->
      <p class="body-small text-center text-text-secondary">
        Don't have an account?
        <a routerLink="/signup" class="font-semibold text-primary no-underline hover:text-primary-light transition-colors">
          Get Started
        </a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = new FormBuilder().group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get emailField() { return this.loginForm.get('email'); }
  get passwordField() { return this.loginForm.get('password'); }

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;
    this.authService.login({ email: email!, password: password! })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message ?? 'Invalid email or password. Please try again.');
        },
        complete: () => this.isSubmitting.set(false),
      });
  }
}
