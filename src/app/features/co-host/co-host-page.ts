import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoHostService, CoHost } from '../../core/services/co-host.service';
import { EventService } from '../../core/services/event.service';
import { EventSummary } from '../../core/models/event';

@Component({
  selector: 'app-co-host-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './co-host-page.html',
  styleUrl: './co-host-page.scss',
})
export class CoHostPage implements OnInit {
  private readonly coHostService = inject(CoHostService);
  private readonly eventService = inject(EventService);

  protected readonly events = signal<EventSummary[]>([]);
  protected readonly selectedEventId = signal<number | null>(null);
  protected readonly coHosts = signal<CoHost[]>([]);
  protected readonly loading = signal(false);
  protected readonly eventsLoading = signal(true);
  protected readonly searchQuery = signal('');
  protected readonly showAddForm = signal(false);
  protected readonly adding = signal(false);

  protected readonly addForm = signal({ email: '', permission: 'VIEW' });

  ngOnInit(): void {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.eventsLoading.set(true);
    this.eventService.listEvents(0, 100).subscribe({
      next: (res) => {
        this.events.set(res.content);
        this.eventsLoading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.eventsLoading.set(false);
      },
    });
  }

  protected onEventChange(eventId: number): void {
    this.selectedEventId.set(eventId);
    if (eventId) {
      this.loadCoHosts();
    } else {
      this.coHosts.set([]);
    }
  }

  protected loadCoHosts(): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.loading.set(true);
    this.coHostService.listCoHosts(eventId).subscribe({
      next: (hosts) => {
        this.coHosts.set(hosts);
        this.loading.set(false);
      },
      error: () => {
        this.coHosts.set([]);
        this.loading.set(false);
      },
    });
  }

  protected addCoHost(): void {
    const eventId = this.selectedEventId();
    const form = this.addForm();
    if (!eventId || !form.email.trim()) return;
    this.adding.set(true);
    this.coHostService.addCoHost(eventId, form.email.trim(), form.permission).subscribe({
      next: () => {
        this.addForm.set({ email: '', permission: 'VIEW' });
        this.showAddForm.set(false);
        this.adding.set(false);
        this.loadCoHosts();
      },
      error: () => this.adding.set(false),
    });
  }

  protected removeCoHost(coHostId: number): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.coHostService.removeCoHost(eventId, coHostId).subscribe({
      next: () => this.loadCoHosts(),
    });
  }

  protected togglePermission(coHost: CoHost): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    const newPermission = coHost.permission === 'VIEW' ? 'EDIT' : 'VIEW';
    this.coHostService.updatePermission(eventId, coHost.id, newPermission).subscribe({
      next: () => this.loadCoHosts(),
    });
  }

  protected filteredCoHosts(): CoHost[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.coHosts();
    return this.coHosts().filter(ch =>
      ch.userName?.toLowerCase().includes(query) ||
      ch.userEmail?.toLowerCase().includes(query)
    );
  }

  protected updateFormEmail(email: string): void {
    this.addForm.update(f => ({ ...f, email }));
  }

  protected updateFormPermission(permission: string): void {
    this.addForm.update(f => ({ ...f, permission }));
  }
}
