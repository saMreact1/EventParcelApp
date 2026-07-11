import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 no-underline">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span class="text-sm font-bold text-text-inverse">EP</span>
          </div>
          <span class="heading-5 text-text-primary hidden sm:inline">
            Event Parcel
          </span>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <a routerLink="/features" class="body-small font-medium text-text-secondary no-underline transition-colors hover:text-primary">
            Features
          </a>
          <a routerLink="/about" class="body-small font-medium text-text-secondary no-underline transition-colors hover:text-primary">
            About
          </a>
          <a routerLink="/faq" class="body-small font-medium text-text-secondary no-underline transition-colors hover:text-primary">
            FAQs
          </a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <a routerLink="/login"
             class="hidden sm:inline-flex body-small font-semibold text-text-secondary no-underline transition-colors hover:text-primary">
            Login
          </a>
          <a routerLink="/signup"
             class="inline-flex items-center rounded-lg bg-primary px-4 py-2 body-small font-semibold text-text-inverse no-underline transition-all hover:bg-primary-light active:bg-primary-dark">
            Get Started
          </a>

          <!-- Mobile menu button -->
          <button (click)="toggleMenu()"
                  class="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-surface-alt transition-colors"
                  [attr.aria-expanded]="isMenuOpen()"
                  aria-label="Toggle navigation menu">
            @if (isMenuOpen()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (isMenuOpen()) {
        <div class="md:hidden border-t border-border bg-card px-4 pb-4 pt-2">
          <nav class="flex flex-col gap-2">
            <a routerLink="/features" (click)="closeMenu()"
               class="rounded-lg px-3 py-2 body-base font-medium text-text-secondary no-underline transition-colors hover:bg-surface-alt">
              Features
            </a>
            <a routerLink="/about" (click)="closeMenu()"
               class="rounded-lg px-3 py-2 body-base font-medium text-text-secondary no-underline transition-colors hover:bg-surface-alt">
              About
            </a>
            <a routerLink="/faq" (click)="closeMenu()"
               class="rounded-lg px-3 py-2 body-base font-medium text-text-secondary no-underline transition-colors hover:bg-surface-alt">
              FAQs
            </a>
            <hr class="my-2 border-border">
            <a routerLink="/login" (click)="closeMenu()"
               class="rounded-lg px-3 py-2 body-base font-semibold text-text-primary no-underline transition-colors hover:bg-surface-alt">
              Login
            </a>
          </nav>
        </div>
      }
    </header>
  `,
  styles: `
    :host { display: contents; }
  `
})
export class Topbar {
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
