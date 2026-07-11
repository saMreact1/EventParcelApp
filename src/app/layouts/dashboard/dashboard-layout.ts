import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthStore } from '../../core/stores/auth.store';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmModalComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected readonly sidebarOpen = signal(false);
  protected readonly profileOpen = signal(false);
  protected readonly navigating = signal(false);

  private routerSub!: Subscription;

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigating.set(true);
      } else if (event instanceof NavigationEnd) {
        this.navigating.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  protected readonly menuItems = [
    { label: 'Dashboard', path: '/dashboard', exact: true, icon: 'dashboard' },
    { label: 'Events', path: '/dashboard/events', exact: false, icon: 'events' },
    { label: 'Orders', path: '/dashboard/orders', exact: false, icon: 'orders' },
    { label: 'Delivery', path: '/dashboard/delivery', exact: false, icon: 'delivery' },
    { label: 'Transactions', path: '/dashboard/transactions', exact: false, icon: 'transactions' },
  ];

  protected readonly adminItems = [
    { label: 'Co-Host', path: '/dashboard/co-host', exact: false, icon: 'cohost' },
    { label: 'Discounts', path: '/dashboard/discounts', exact: false, icon: 'discounts' },
  ];

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.profileOpen.set(false);
    }
  }

  protected initials(): string {
    const name = this.store.userName();
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 1);
  }

  protected toggleProfile(): void {
    this.profileOpen.update(v => !v);
  }

  protected logout(): void {
    this.profileOpen.set(false);
    this.authService.logout();
  }
}
