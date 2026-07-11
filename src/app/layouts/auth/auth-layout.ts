import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex min-h-screen">
      <!-- Left: Auth Form -->
      <div class="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-8 xl:px-12">
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </div>

      <!-- Right: Visual Panel -->
      <div class="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-accent overflow-hidden">
        <div class="absolute inset-0 opacity-10"
             style="background-image: radial-gradient(circle at 25% 50%, white 1px, transparent 1px); background-size: 30px 30px;">
        </div>
        <div class="relative z-10 max-w-md text-center px-8">
          <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <span class="text-2xl font-bold text-white">EP</span>
          </div>
          <h2 class="heading-3 text-white mb-4">
            The easiest way to sell, track & deliver Aso-Ebi
          </h2>
          <p class="body-base text-white/80">
            Create an Aso-Ebi sales page backed by powerful tools that help you track payments, delivery, and manage your buyers.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: contents; }
  `
})
export class AuthLayout {}
