import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { DiscountService, Discount } from '../../../core/services/discount.service';
import { DeliveryService, Delivery } from '../../../core/services/delivery.service';
import { EventDetail, Guest, GuestStats, EventGroup, PaginatedResponse } from '../../../core/models/event';
import { CoHostService, CoHost } from '../../../core/services/co-host.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

type TabId = 'overview' | 'fabrics' | 'guests' | 'orders' | 'delivery' | 'co-hosts' | 'discounts';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './event-detail-page.html',
  styleUrl: './event-detail-page.scss',
})
export class EventDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly discountService = inject(DiscountService);
  private readonly coHostService = inject(CoHostService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmService);

  protected readonly activeTab = signal<TabId>('overview');
  protected readonly loading = signal(true);
  protected readonly event = signal<EventDetail | null>(null);
  protected readonly copied = signal(false);

  // Groups (for overview preview)
  protected readonly groups = signal<EventGroup[]>([]);
  protected readonly groupsLoading = signal(false);
  protected readonly mapError = signal(false);

  // Guests
  protected readonly guests = signal<Guest[]>([]);
  protected readonly guestStats = signal<GuestStats | null>(null);
  protected readonly guestsLoading = signal(false);
  protected readonly guestsPage = signal(0);
  protected readonly guestsTotal = signal(0);
  protected readonly guestSearch = signal('');
  protected readonly showAddGuest = signal(false);
  protected readonly addingGuest = signal(false);
  protected readonly showImportGuests = signal(false);
  protected readonly importCsvText = signal('');
  protected readonly importingGuests = signal(false);
  protected readonly importResult = signal<{ imported: number; skipped: number } | null>(null);

  // Co-Hosts
  protected readonly coHosts = signal<CoHost[]>([]);
  protected readonly coHostsLoading = signal(false);
  protected readonly showAddCoHost = signal(false);
  protected readonly addingCoHost = signal(false);
  protected readonly coHostForm = signal({ email: '', permission: 'VIEW' });

  protected readonly guestForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.email]],
    phone: [''],
  });

  protected readonly deliveries = signal<Delivery[]>([]);
  protected readonly deliveriesLoading = signal(false);
  protected readonly copiedTracking = signal<string | null>(null);
  protected readonly updatingDeliveryStatus = signal<number | null>(null);

  protected readonly discounts = signal<Discount[]>([]);
  protected readonly discountsLoading = signal(false);

  protected readonly tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'fabrics', label: 'Fabrics' },
    { id: 'guests', label: 'Guests' },
    { id: 'orders', label: 'Orders' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'co-hosts', label: 'Co-Hosts' },
    { id: 'discounts', label: 'Discounts' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.eventService.getEvent(id).subscribe({
        next: (event) => {
          this.event.set(event);
          this.loading.set(false);
          this.loadGuests();
          this.loadGuestStats();
          this.loadGroups();
        },
        error: () => this.loading.set(false),
      });
    }
  }

  protected setTab(id: TabId): void {
    this.activeTab.set(id);
    if (id === 'guests' && this.guests().length === 0) {
      this.loadGuests();
      this.loadGuestStats();
    }
    if (id === 'overview' && this.groups().length === 0) {
      this.loadGroups();
    }
    if (id === 'delivery' && this.deliveries().length === 0) {
      this.loadDeliveries();
    }
    if (id === 'co-hosts' && this.coHosts().length === 0) {
      this.loadCoHosts();
    }
    if (id === 'discounts' && this.discounts().length === 0) {
      this.loadDiscounts();
    }
  }

  protected copyShareLink(): void {
    const ev = this.event();
    if (!ev) return;
    const url = `${window.location.origin}/event/${ev.eventCode}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  protected loadGuests(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.guestsLoading.set(true);
    this.eventService.listGuests(eventId, this.guestsPage(), 20, this.guestSearch() || undefined).subscribe({
      next: (res) => {
        this.guests.set(res.content);
        this.guestsTotal.set(res.totalElements);
        this.guestsLoading.set(false);
      },
      error: () => { this.guests.set([]); this.guestsLoading.set(false); },
    });
  }

  protected loadGuestStats(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.eventService.getGuestStats(eventId).subscribe({
      next: (stats) => this.guestStats.set(stats),
      error: () => {},
    });
  }

  protected loadGroups(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.groupsLoading.set(true);
    this.eventService.listGroups(eventId).subscribe({
      next: (groups) => { this.groups.set(groups); this.groupsLoading.set(false); },
      error: () => { this.groups.set([]); this.groupsLoading.set(false); },
    });
  }

  protected loadDeliveries(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.deliveriesLoading.set(true);
    this.deliveryService.listDeliveries(eventId).subscribe({
      next: (res) => { this.deliveries.set(res.content); this.deliveriesLoading.set(false); },
      error: () => { this.deliveries.set([]); this.deliveriesLoading.set(false); },
    });
  }

  protected loadCoHosts(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.coHostsLoading.set(true);
    this.coHostService.listCoHosts(eventId).subscribe({
      next: (hosts) => { this.coHosts.set(hosts); this.coHostsLoading.set(false); },
      error: () => { this.coHosts.set([]); this.coHostsLoading.set(false); },
    });
  }

  protected addCoHost(): void {
    const eventId = this.event()?.id;
    const form = this.coHostForm();
    if (!eventId || !form.email.trim()) return;
    this.addingCoHost.set(true);
    this.coHostService.addCoHost(eventId, form.email.trim(), form.permission).subscribe({
      next: () => {
        this.coHostForm.set({ email: '', permission: 'VIEW' });
        this.showAddCoHost.set(false);
        this.addingCoHost.set(false);
        this.loadCoHosts();
      },
      error: () => this.addingCoHost.set(false),
    });
  }

  protected removeCoHost(coHostId: number): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.coHostService.removeCoHost(eventId, coHostId).subscribe({
      next: () => this.loadCoHosts(),
    });
  }

  protected toggleCoHostPermission(coHost: CoHost): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    const newPermission = coHost.permission === 'VIEW' ? 'EDIT' : 'VIEW';
    this.coHostService.updatePermission(eventId, coHost.id, newPermission).subscribe({
      next: () => this.loadCoHosts(),
    });
  }

  protected updateCoHostFormEmail(email: string): void {
    this.coHostForm.update(f => ({ ...f, email }));
  }

  protected updateCoHostFormPermission(permission: string): void {
    this.coHostForm.update(f => ({ ...f, permission }));
  }

  protected loadDiscounts(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.discountsLoading.set(true);
    this.discountService.listDiscounts(eventId).subscribe({
      next: (discounts) => { this.discounts.set(discounts); this.discountsLoading.set(false); },
      error: () => { this.discounts.set([]); this.discountsLoading.set(false); },
    });
  }

  protected toggleEventDiscount(discount: Discount): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.discountService.toggleActive(eventId, discount.id).subscribe({
      next: () => this.loadDiscounts(),
    });
  }

  protected async deleteEventDiscount(discount: Discount): Promise<void> {
    const eventId = this.event()?.id;
    if (!eventId) return;
    const ok = await this.confirm.confirm({
      title: 'Delete Discount',
      message: `Delete discount code "${discount.code}"? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) {
      this.discountService.deleteDiscount(eventId, discount.id).subscribe({
        next: () => this.loadDiscounts(),
      });
    }
  }

  protected nextDeliveryStatus(current: string): string | null {
    const flow = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    const idx = flow.indexOf(current);
    if (idx < 0 || idx >= flow.length - 1) return null;
    return flow[idx + 1];
  }

  protected nextDeliveryStatusLabel(current: string): string {
    const next = this.nextDeliveryStatus(current);
    if (!next) return '';
    const labels: Record<string, string> = {
      PICKED_UP: 'Pick Up',
      IN_TRANSIT: 'Ship',
      DELIVERED: 'Deliver',
    };
    return labels[next] ?? next;
  }

  protected advanceDeliveryStatus(delivery: Delivery): void {
    const next = this.nextDeliveryStatus(delivery.status);
    const eventId = this.event()?.id;
    if (!next || !eventId) return;
    this.updatingDeliveryStatus.set(delivery.id);
    this.deliveryService.updateStatus(eventId, delivery.id, next).subscribe({
      next: () => { this.updatingDeliveryStatus.set(null); this.loadDeliveries(); },
      error: () => this.updatingDeliveryStatus.set(null),
    });
  }

  protected copyTrackingCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedTracking.set(code);
      setTimeout(() => this.copiedTracking.set(null), 2000);
    });
  }

  protected discountTypeBadge(type: string): string {
    return type === 'PERCENT' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700';
  }

  protected discountValue(discount: Discount): string {
    if (discount.type === 'PERCENT') return `${discount.value}%`;
    return `₦${discount.value.toLocaleString()}`;
  }

  protected daysUntilEvent(): number {
    const ev = this.event();
    if (!ev) return 0;
    const eventDate = new Date(ev.eventDate);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  protected formatEventDate(): string {
    const ev = this.event();
    if (!ev) return '';
    const d = new Date(ev.eventDate);
    return d.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  protected formatEventTime(): string {
    const ev = this.event();
    if (!ev) return '';
    return ev.eventTime || '';
  }

  protected formatCurrency(amount: number, currency?: string): string {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN', minimumFractionDigits: 0 }).format(amount);
  }

  protected groupPackageCount(group: EventGroup): number {
    return group.packages?.length ?? 0;
  }

  protected onGuestSearch(term: string): void {
    this.guestSearch.set(term);
    this.guestsPage.set(0);
    this.loadGuests();
  }

  protected addGuest(): void {
    if (this.guestForm.invalid) return;
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.addingGuest.set(true);
    const val = this.guestForm.value;
    this.eventService.addGuest(eventId, {
      fullName: val.fullName!,
      email: val.email || undefined,
      phone: val.phone || undefined,
    }).subscribe({
      next: () => {
        this.showAddGuest.set(false);
        this.guestForm.reset();
        this.addingGuest.set(false);
        this.loadGuests();
        this.loadGuestStats();
      },
      error: () => this.addingGuest.set(false),
    });
  }

  protected async removeGuest(guestId: number, guestName: string): Promise<void> {
    const eventId = this.event()?.id;
    if (!eventId) return;
    const ok = await this.confirm.confirm({
      title: 'Remove Guest',
      message: `Remove "${guestName}" from this event? This cannot be undone.`,
      confirmText: 'Remove',
      variant: 'danger',
    });
    if (ok) {
      this.eventService.removeGuest(eventId, guestId).subscribe({
        next: () => { this.loadGuests(); this.loadGuestStats(); },
      });
    }
  }

  protected nextGuestPage(): void {
    this.guestsPage.update(p => p + 1);
    this.loadGuests();
  }

  protected prevGuestPage(): void {
    this.guestsPage.update(p => Math.max(0, p - 1));
    this.loadGuests();
  }

  protected sendInvitation(guestId: number): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.eventService.sendInvitation(eventId, guestId).subscribe({
      next: () => { this.loadGuests(); this.loadGuestStats(); },
    });
  }

  protected sendAllInvitations(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    this.eventService.sendAllInvitations(eventId).subscribe({
      next: () => { this.loadGuests(); this.loadGuestStats(); },
    });
  }

  protected copyRsvpLink(token: string | null): void {
    if (!token) return;
    const url = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  protected statusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-50 text-emerald-700',
      DRAFT: 'bg-gray-100 text-gray-600',
      CLOSED: 'bg-blue-50 text-blue-700',
      CANCELLED: 'bg-red-50 text-red-700',
      PENDING: 'bg-gray-100 text-gray-600',
      PICKED_UP: 'bg-blue-50 text-blue-700',
      IN_TRANSIT: 'bg-amber-50 text-amber-700',
      DELIVERED: 'bg-emerald-50 text-emerald-700',
      RETURNED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected rsvpClass(rsvp: string): string {
    const map: Record<string, string> = {
      GOING: 'bg-emerald-50 text-emerald-700',
      MAYBE: 'bg-amber-50 text-amber-700',
      DECLINED: 'bg-red-50 text-red-700',
      PENDING: 'bg-gray-100 text-gray-600',
    };
    return map[rsvp] ?? 'bg-gray-100 text-gray-600';
  }

  protected guestPageEnd(): number {
    return Math.min((this.guestsPage() + 1) * 20, this.guestsTotal());
  }

  protected importGuests(): void {
    const csv = this.importCsvText().trim();
    if (!csv) return;

    const lines = csv.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // Skip header row if it looks like a header
    const startIdx = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('full') ? 1 : 0;

    const guests: { fullName: string; email?: string; phone?: string }[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts[0]) {
        guests.push({
          fullName: parts[0],
          email: parts[1] || undefined,
          phone: parts[2] || undefined,
        });
      }
    }

    if (guests.length === 0) return;

    this.importingGuests.set(true);
    this.importResult.set(null);

    const eventId = this.event()?.id;
    if (!eventId) return;

    this.eventService.bulkImportGuests(eventId, guests).subscribe({
      next: (result: any) => {
        this.importResult.set(result);
        this.importingGuests.set(false);
        if (result.imported > 0) {
          this.loadGuests();
          this.loadGuestStats();
        }
      },
      error: () => {
        this.importingGuests.set(false);
      },
    });
  }
}
