import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { EventService } from '../../core/services/event.service';
import { OrderSummary, PaginatedResponse, OrderStatus, EventSummary } from '../../core/models/event';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly eventService = inject(EventService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly searchQuery = signal('');
  protected readonly activeTab = signal<'all' | 'PAID' | 'PENDING' | 'FAILED'>('all');
  protected readonly orders = signal<OrderSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly currentPage = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly pageSize = signal(20);

  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly showBulkModal = signal(false);
  protected readonly bulkShipping = signal(false);
  protected readonly bulkResults = signal<{ success: number; skipped: number } | null>(null);

  protected readonly selectedEventId = signal<number | null>(null);
  protected readonly events = signal<EventSummary[]>([]);

  protected readonly tabs = [
    { id: 'all' as const, label: 'All Orders' },
    { id: 'PAID' as const, label: 'Paid' },
    { id: 'PENDING' as const, label: 'Pending' },
    { id: 'FAILED' as const, label: 'Failed' },
  ];

  ngOnInit(): void {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.eventService.listEvents(0, 100).subscribe({
      next: (res) => {
        this.events.set(res.content);
        if (res.content.length > 0 && !this.selectedEventId()) {
          this.selectedEventId.set(res.content[0].id);
          this.loadOrders();
        }
      },
      error: () => {},
    });
  }

  protected setEventFilter(eventId: number | null): void {
    this.selectedEventId.set(eventId);
    this.currentPage.set(0);
    this.loadOrders();
  }

  protected setTab(tab: 'all' | 'PAID' | 'PENDING' | 'FAILED'): void {
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    this.selectedIds.set(new Set());
    const status = this.activeTab() === 'all' ? undefined : this.activeTab() as OrderStatus;
    const eventId = this.selectedEventId();

    if (eventId) {
      this.orderService.listEventOrders(eventId, this.currentPage(), this.pageSize(), status).subscribe({
        next: (res) => {
          this.orders.set(res.content);
          this.totalPages.set(res.totalPages);
          this.totalElements.set(res.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.orders.set([]);
          this.loading.set(false);
        },
      });
    } else {
      this.orderService.listHostOrders(this.currentPage(), this.pageSize(), status).subscribe({
        next: (res) => {
          this.orders.set(res.content);
          this.totalPages.set(res.totalPages);
          this.totalElements.set(res.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.orders.set([]);
          this.loading.set(false);
        },
      });
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadOrders();
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => Math.max(0, p - 1));
      this.loadOrders();
    }
  }

  protected navigateToOrder(orderCode: string): void {
    this.router.navigate(['/dashboard/orders', orderCode]);
  }

  protected filteredOrders(): OrderSummary[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.orders();
    return this.orders().filter(o =>
      o.guestName?.toLowerCase().includes(query) ||
      o.orderCode?.toLowerCase().includes(query)
    );
  }

  protected statusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'bg-emerald-50 text-emerald-700',
      PENDING: 'bg-amber-50 text-amber-700',
      FAILED: 'bg-red-50 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-600',
      CANCELLED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  // Selection
  protected toggleSelect(id: number): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected toggleSelectAll(): void {
    const shippable = this.filteredOrders().filter(o => o.paymentStatus === 'PAID');
    if (this.selectedIds().size === shippable.length && shippable.length > 0) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(shippable.map(o => o.id)));
    }
  }

  protected isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  protected selectedCount(): number {
    return this.selectedIds().size;
  }

  protected shippableCount(): number {
    return this.filteredOrders().filter(o => o.paymentStatus === 'PAID' && !o.shipped).length;
  }

  // CSV Export
  protected exportCsv(): void {
    const rows = this.filteredOrders();
    const headers = ['Order Code', 'Event', 'Guest', 'Amount', 'Status', 'Address', 'City', 'State', 'Phone', 'Date'];
    const csvRows = [headers.join(',')];

    for (const o of rows) {
      csvRows.push([
        `"${o.orderCode}"`,
        `"${(o.eventName || '').replace(/"/g, '""')}"`,
        `"${(o.guestName || '').replace(/"/g, '""')}"`,
        o.totalAmount,
        o.paymentStatus,
        `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
        `"${(o.deliveryCity || '').replace(/"/g, '""')}"`,
        `"${(o.deliveryState || '').replace(/"/g, '""')}"`,
        `"${(o.deliveryPhone || '').replace(/"/g, '""')}"`,
        `"${o.createdAt}"`,
      ].join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Bulk ship
  protected openBulkShipModal(): void {
    if (this.selectedIds().size === 0) return;
    this.bulkResults.set(null);
    this.showBulkModal.set(true);
  }

  protected closeBulkModal(): void {
    this.showBulkModal.set(false);
    this.bulkResults.set(null);
  }

  protected shipSingleOrder(order: OrderSummary): void {
    if (!order.deliveryAddress || !order.deliveryCity) return;
    this.selectedIds.set(new Set([order.id]));
    this.bulkResults.set(null);
    this.showBulkModal.set(true);
  }

  protected bulkShip(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    // Group by eventId
    const byEvent = new Map<number, number[]>();
    for (const order of this.orders()) {
      if (ids.includes(order.id)) {
        const list = byEvent.get(order.eventId) || [];
        list.push(order.id);
        byEvent.set(order.eventId, list);
      }
    }

    this.bulkShipping.set(true);
    let totalSuccess = 0;
    let totalSkipped = 0;
    let completed = 0;

    for (const [eventId, orderIds] of byEvent) {
      this.deliveryService.bulkCreateDeliveries(eventId, orderIds).subscribe({
        next: (deliveries) => {
          totalSuccess += deliveries.length;
          totalSkipped += orderIds.length - deliveries.length;
          completed++;
          if (completed === byEvent.size) {
            this.bulkResults.set({ success: totalSuccess, skipped: totalSkipped });
            this.bulkShipping.set(false);
            this.selectedIds.set(new Set());
            this.loadOrders();
          }
        },
        error: () => {
          totalSkipped += orderIds.length;
          completed++;
          if (completed === byEvent.size) {
            this.bulkResults.set({ success: totalSuccess, skipped: totalSkipped });
            this.bulkShipping.set(false);
            this.selectedIds.set(new Set());
            this.loadOrders();
          }
        },
      });
    }
  }
}
