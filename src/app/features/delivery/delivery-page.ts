import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeliveryService, Delivery } from '../../core/services/delivery.service';
import { EventService } from '../../core/services/event.service';
import { EventSummary } from '../../core/models/event';

@Component({
  selector: 'app-delivery-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delivery-page.html',
  styleUrl: './delivery-page.scss',
})
export class DeliveryPage implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  private readonly eventService = inject(EventService);

  protected readonly searchQuery = signal('');
  protected readonly activeTab = signal<'all' | 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'>('all');
  protected readonly deliveries = signal<Delivery[]>([]);
  protected readonly loading = signal(true);
  protected readonly events = signal<EventSummary[]>([]);
  protected readonly copiedTracking = signal<string | null>(null);
  protected readonly updatingStatus = signal<number | null>(null);
  protected readonly selectedDelivery = signal<Delivery | null>(null);
  protected readonly selectedEventId = signal<number | null>(null);

  protected readonly statusOptions = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

  protected readonly tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'PENDING' as const, label: 'Pending' },
    { id: 'PICKED_UP' as const, label: 'Picked Up' },
    { id: 'IN_TRANSIT' as const, label: 'In Transit' },
    { id: 'DELIVERED' as const, label: 'Delivered' },
  ];

  ngOnInit(): void {
    this.loadEvents();
  }

  protected setTab(tab: 'all' | 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'): void {
    this.activeTab.set(tab);
    this.loadDeliveries();
  }

  private loadEvents(): void {
    this.loading.set(true);
    this.eventService.listEvents(0, 100).subscribe({
      next: (res) => {
        this.events.set(res.content);
        if (res.content.length > 0 && !this.selectedEventId()) {
          this.selectedEventId.set(res.content[0].id);
        }
        this.loadDeliveries();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected setEventFilter(eventId: number | null): void {
    this.selectedEventId.set(eventId);
    this.loadDeliveries();
  }

  protected loadDeliveries(): void {
    this.loading.set(true);
    const eventId = this.selectedEventId();
    
    if (!eventId) {
      this.deliveries.set([]);
      this.loading.set(false);
      return;
    }

    const status = this.activeTab() === 'all' ? undefined : this.activeTab();
    
    this.deliveryService.listDeliveries(eventId, 0, 100, status).subscribe({
      next: (res) => {
        this.deliveries.set(res.content);
        this.loading.set(false);
      },
      error: () => {
        this.deliveries.set([]);
        this.loading.set(false);
      },
    });
  }

  protected filteredDeliveries(): Delivery[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.deliveries();
    return this.deliveries().filter(d =>
      d.guestName?.toLowerCase().includes(query) ||
      d.orderCode?.toLowerCase().includes(query) ||
      d.trackingCode?.toLowerCase().includes(query) ||
      d.address?.toLowerCase().includes(query)
    );
  }

  protected statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-600',
      PICKED_UP: 'bg-blue-50 text-blue-700',
      IN_TRANSIT: 'bg-amber-50 text-amber-700',
      DELIVERED: 'bg-emerald-50 text-emerald-700',
      RETURNED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected nextStatus(current: string): string | null {
    const flow = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    const idx = flow.indexOf(current);
    if (idx < 0 || idx >= flow.length - 1) return null;
    return flow[idx + 1];
  }

  protected nextStatusLabel(current: string): string {
    const next = this.nextStatus(current);
    if (!next) return '';
    const labels: Record<string, string> = {
      PICKED_UP: 'Mark as Picked Up',
      IN_TRANSIT: 'Mark as In Transit',
      DELIVERED: 'Mark as Delivered',
    };
    return labels[next] ?? next;
  }

  protected advanceStatus(delivery: Delivery): void {
    const next = this.nextStatus(delivery.status);
    if (!next) return;
    this.updatingStatus.set(delivery.id);
    const eventId = this.events().find(e => e.title === delivery.eventTitle)?.id;
    if (!eventId) { this.updatingStatus.set(null); return; }
    this.deliveryService.updateStatus(eventId, delivery.id, next).subscribe({
      next: () => {
        this.updatingStatus.set(null);
        this.loadDeliveries();
      },
      error: () => this.updatingStatus.set(null),
    });
  }

  protected copyTrackingCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedTracking.set(code);
      setTimeout(() => this.copiedTracking.set(null), 2000);
    });
  }

  protected openDetail(delivery: Delivery): void {
    this.selectedDelivery.set(delivery);
  }

  protected closeDetail(): void {
    this.selectedDelivery.set(null);
  }

  protected formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
