import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { EventDetail, EventGroup, EventPackage } from '../../core/models/event';
import { EventService } from '../../core/services/event.service';
import { ApiResponse } from '../../core/models/user';

@Component({
  selector: 'app-guest-event-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './guest-event-page.html',
  styleUrl: './guest-event-page.scss',
})
export class GuestEventPage implements OnInit {
  private static readonly VALID_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'];
  protected readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly http = inject(HttpClient);

  protected readonly event = signal<EventDetail | null>(null);
  protected readonly groups = signal<EventGroup[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cart = signal<Map<number, number>>(new Map());
  protected readonly showCart = signal(false);
  protected readonly filterGroupId = signal<number | null>(null);

  protected readonly filteredGroups = computed(() => {
    const filterId = this.filterGroupId();
    const allGroups = this.groups();
    if (filterId !== null) {
      return allGroups.filter(g => g.id === filterId);
    }
    return allGroups;
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.error.set('Invalid event link');
      this.loading.set(false);
      return;
    }
    const groupParam = this.route.snapshot.queryParamMap.get('group');
    if (groupParam) {
      this.filterGroupId.set(Number(groupParam));
    }
    this.loadEvent(code);
  }

  private loadEvent(code: string): void {
    this.eventService.getEventByCode(code).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loadGroups(code);
      },
      error: () => {
        this.error.set('Event not found. Please check the event code.');
        this.loading.set(false);
      },
    });
  }

  private loadGroups(code: string): void {
    this.http.get<ApiResponse<EventGroup[]>>(`${environment.apiUrl}/events/by-code/${code}/groups`).pipe(
      map(res => res.data)
    ).subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  addToCart(pkg: EventPackage): void {
    const updated = new Map(this.cart());
    updated.set(pkg.id, 1);
    this.cart.set(updated);
  }

  incrementQty(pkgId: number): void {
    const updated = new Map(this.cart());
    const current = updated.get(pkgId) || 1;
    updated.set(pkgId, current + 1);
    this.cart.set(updated);
  }

  decrementQty(pkgId: number): void {
    const updated = new Map(this.cart());
    const current = updated.get(pkgId) || 1;
    if (current <= 1) {
      updated.delete(pkgId);
    } else {
      updated.set(pkgId, current - 1);
    }
    this.cart.set(updated);
  }

  removeFromCart(pkgId: number): void {
    const updated = new Map(this.cart());
    updated.delete(pkgId);
    this.cart.set(updated);
  }

  isInCart(pkgId: number): boolean {
    return this.cart().has(pkgId);
  }

  getQty(pkgId: number): number {
    return this.cart().get(pkgId) || 0;
  }

  get cartItemCount(): number {
    let count = 0;
    for (const qty of this.cart().values()) {
      count += qty;
    }
    return count;
  }

  get cartUniqueCount(): number {
    return this.cart().size;
  }

  get cartTotal(): number {
    let total = 0;
    for (const [pkgId, qty] of this.cart()) {
      for (const group of this.groups()) {
        const pkg = group.packages?.find((p) => p.id === pkgId);
        if (pkg) {
          total += pkg.price * qty;
          break;
        }
      }
    }
    return total;
  }

  cartItems(): { pkg: EventPackage; qty: number; subtotal: number }[] {
    const items: { pkg: EventPackage; qty: number; subtotal: number }[] = [];
    for (const [pkgId, qty] of this.cart()) {
      for (const group of this.groups()) {
        const pkg = group.packages?.find((p) => p.id === pkgId);
        if (pkg) {
          items.push({ pkg, qty, subtotal: pkg.price * qty });
          break;
        }
      }
    }
    return items;
  }

  findPackage(pkgId: number): EventPackage | null {
    for (const group of this.groups()) {
      const pkg = group.packages?.find((p) => p.id === pkgId);
      if (pkg) return pkg;
    }
    return null;
  }

  proceedToCheckout(): void {
    const code = this.route.snapshot.paramMap.get('code');
    const pkgIds = Array.from(this.cart().entries()).map(([id, qty]) => ({
      eventPackageId: id,
      quantity: qty,
    }));
    this.router.navigate([`/event/${code}/checkout`], {
      state: { items: pkgIds, totalAmount: this.cartTotal, currency: this.cartCurrency },
    });
  }

  protected formatPrice(amount: number, currency?: string): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  protected getGroupForPackage(pkg: EventPackage): EventGroup | undefined {
    return this.groups().find(g => g.packages?.some(p => p.id === pkg.id));
  }

  protected get cartCurrency(): string {
    for (const [pkgId] of this.cart()) {
      const group = this.groups().find(g => g.packages?.some(p => p.id === pkgId));
      if (group?.currency && GuestEventPage.VALID_CURRENCIES.includes(group.currency)) {
        return group.currency;
      }
    }
    return 'NGN';
  }
}
