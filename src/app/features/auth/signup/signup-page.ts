import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary lg:hidden">
          <span class="text-lg font-bold text-white">EP</span>
        </div>
        <h1 class="heading-3 text-text-primary">Create your account</h1>
        <p class="body-base text-text-secondary mt-2">
          Start managing your Aso-Ebi effortlessly
        </p>
      </div>

      <!-- Signup Form -->
      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">

        @if (errorMessage(); as msg) {
          <div class="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3">
            <svg class="h-5 w-5 flex-shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="body-small text-error">{{ msg }}</p>
          </div>
        }
        <div>
          <label for="fullName" class="body-small font-medium text-text-primary block mb-1.5">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            formControlName="fullName"
            placeholder="Your full name"
            class="block w-full rounded-lg border border-border bg-card px-4 py-2.5 body-base text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autocomplete="name"
          />
        </div>

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
            autocomplete="email"
          />
        </div>

        <div>
          <label for="phone" class="body-small font-medium text-text-primary block mb-1.5">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            formControlName="phone"
            placeholder="+234 800 000 0000"
            class="block w-full rounded-lg border border-border bg-card px-4 py-2.5 body-base text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autocomplete="tel"
          />
        </div>

        <div>
          <label for="password" class="body-small font-medium text-text-primary block mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            placeholder="Create a strong password"
            class="block w-full rounded-lg border border-border bg-card px-4 py-2.5 body-base text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autocomplete="new-password"
          />
        </div>

        <div class="flex items-start gap-2">
          <input type="checkbox" formControlName="agreeTerms"
                 class="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20" />
          <p class="body-xs text-text-secondary">
            By proceeding, you agree to our
            <a href="/privacy-policy" class="text-primary no-underline hover:text-primary-light">Privacy Policy</a>
            and
            <a href="/terms" class="text-primary no-underline hover:text-primary-light">Terms & Conditions</a>
          </p>
        </div>

        <button type="submit"
                [disabled]="signupForm.invalid || isSubmitting()"
                class="w-full rounded-lg bg-primary px-4 py-2.5 body-base font-semibold text-text-inverse transition-all hover:bg-primary-light active:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">
          @if (isSubmitting()) {
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating account...
            </span>
          } @else {
            Sign up
          }
        </button>
      </form>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center body-xs text-text-muted">
          <span class="bg-card px-2">Or sign up with</span>
        </div>
      </div>

      <!-- Google Signup -->
      <a href="https://api.eventparcel.com/api/v1/auth/google"
         class="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 body-base font-medium text-text-primary no-underline transition-all hover:bg-surface-alt">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </a>

      <!-- Login link -->
      <p class="body-small text-center text-text-secondary">
        Already have an account?
        <a routerLink="/login" class="font-semibold text-primary no-underline hover:text-primary-light transition-colors">
          Sign In
        </a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class SignupPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly signupForm = new FormBuilder().group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    agreeTerms: [false, [Validators.requiredTrue]],
  });

  protected onSubmit(): void {
    if (this.signupForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { fullName, email, phone, password } = this.signupForm.value;

    this.authService.signup({
      fullName: fullName!,
      email: email!,
      phone: phone!,
      password: password!,
    }).subscribe({
        next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
      },
      complete: () => this.isSubmitting.set(false),
    });
  }
}
