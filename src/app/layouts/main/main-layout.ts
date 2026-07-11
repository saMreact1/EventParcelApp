import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './topbar';
import { Footer } from './footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar, Footer],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-topbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: `
    :host { display: contents; }
  `
})
export class MainLayout {}
