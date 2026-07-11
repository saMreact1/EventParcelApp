import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { EventSummary } from '../../../core/models/event';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-event-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './event-list-page.html',
  styleUrl: './event-list-page.scss',
})
export class EventListPage implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly confirm = inject(ConfirmService);

  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<string | null>(null);
  protected readonly currentPage = signal(0);
  protected readonly pageSize = 10;
  protected readonly loading = signal(true);
  protected readonly events = signal<EventSummary[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly openMenuId = signal<number | null>(null);

  protected readonly statusFilters = [
    { label: 'All', value: null },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  ngOnInit(): void {
    this.loadEvents();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId.set(null);
  }

  protected toggleMenu(eventId: number, e: Event): void {
    e.stopPropagation();
    this.openMenuId.set(this.openMenuId() === eventId ? null : eventId);
  }

  protected loadEvents(): void {
    this.loading.set(true);
    const status = this.statusFilter() ?? undefined;
    this.eventService.listEvents(this.currentPage(), this.pageSize, status).subscribe({
      next: (res) => {
        this.events.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.loading.set(false);
      },
    });
  }

  protected setFilter(value: string | null): void {
    this.statusFilter.set(value);
    this.currentPage.set(0);
    this.loadEvents();
  }

  async cancelEvent(id: number, title: string): Promise<void> {
    this.openMenuId.set(null);
    const ok = await this.confirm.confirm({
      title: 'Cancel Event',
      message: `Are you sure you want to cancel "${title}"? The event will be marked as cancelled but still visible.`,
      confirmText: 'Cancel Event',
      variant: 'warning',
    });
    if (ok) {
      this.eventService.cancelEvent(id).subscribe({ next: () => this.loadEvents() });
    }
  }

  async deleteEvent(id: number, title: string): Promise<void> {
    this.openMenuId.set(null);
    const ok = await this.confirm.confirm({
      title: 'Delete Event',
      message: `Permanently delete "${title}"? This will remove all groups, packages, guests, and orders. This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
    });
    if (ok) {
      this.eventService.deleteEvent(id).subscribe({ next: () => this.loadEvents() });
    }
  }

  async cloneEvent(id: number, title: string): Promise<void> {
    this.openMenuId.set(null);
    const ok = await this.confirm.confirm({
      title: 'Clone Event',
      message: `Create a copy of "${title}" with its groups and packages? The new event will be created as a draft.`,
      confirmText: 'Clone',
      variant: 'info',
    });
    if (ok) {
      this.eventService.cloneEvent(id).subscribe({ next: () => this.loadEvents() });
    }
  }

  protected statusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-50 text-emerald-700',
      DRAFT: 'bg-gray-100 text-gray-600',
      CLOSED: 'bg-blue-50 text-blue-700',
      CANCELLED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
