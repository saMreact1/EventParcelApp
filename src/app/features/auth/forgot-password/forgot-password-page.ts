import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary lg:hidden">
          <span class="text-lg font-bold text-white">EP</span>
        </div>
        <h1 class="heading-3 text-text-primary">Forgot your password?</h1>
        <p class="body-base text-text-secondary mt-2">
          No worries. Enter your email and we'll send you a reset link.
        </p>
      </div>

      @if (emailSent()) {
        <div class="rounded-lg bg-success/10 border border-success/20 p-4 text-center">
          <div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <svg class="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="heading-5 text-text-primary mb-1">Check your email</h3>
          <p class="body-small text-text-secondary">
            We've sent a password reset link to <strong class="text-text-primary">{{ emailField?.value }}</strong>
          </p>
        </div>
      } @else {
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">

          @if (errorMessage(); as msg) {
            <div class="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3">
              <svg class="h-5 w-5 flex-shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="body-small text-error">{{ msg }}</p>
            </div>
          }

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
            @if (emailField?.invalid && emailField?.touched) {
              <p class="body-xs text-error mt-1">
                @if (emailField?.errors?.['required']) { Email is required }
                @if (emailField?.errors?.['email']) { Please enter a valid email }
              </p>
            }
          </div>

          <button type="submit"
                  [disabled]="resetForm.invalid || isSubmitting()"
                  class="w-full rounded-lg bg-primary px-4 py-2.5 body-base font-semibold text-text-inverse transition-all hover:bg-primary-light active:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">
            @if (isSubmitting()) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Sending reset link...
              </span>
            } @else {
              Send Reset Link
            }
          </button>
        </form>
      }

      <!-- Back to login -->
      <p class="body-small text-center text-text-secondary">
        <a routerLink="/login" class="inline-flex items-center gap-1 font-medium text-primary no-underline hover:text-primary-light transition-colors">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Login
        </a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);

  protected readonly isSubmitting = signal(false);
  protected readonly emailSent = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly resetForm = new FormBuilder().group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailField() { return this.resetForm.get('email'); }

  protected onSubmit(): void {
    if (this.resetForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword({ email: this.resetForm.value.email! })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.emailSent.set(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message ?? 'Failed to send reset link. Please try again.');
        },
      });
  }
}
