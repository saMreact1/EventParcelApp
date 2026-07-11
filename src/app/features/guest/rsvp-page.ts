import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ApiResponse } from '../../core/models/user';
import { RsvpStatus } from '../../core/models/event';

interface RsvpDetails {
  guestId: number;
  guestName: string;
  rsvpStatus: RsvpStatus;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  coverImageUrl: string;
}

@Component({
  selector: 'app-rsvp-page',
  standalone: true,
  imports: [],
  templateUrl: './rsvp-page.html',
  styleUrl: './rsvp-page.scss',
})
export class RsvpPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly details = signal<RsvpDetails | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly selectedStatus = signal<RsvpStatus | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error.set('Invalid invitation link');
      this.loading.set(false);
      return;
    }
    this.loadDetails(token);
  }

  private loadDetails(token: string): void {
    this.http.get<ApiResponse<RsvpDetails>>(`${environment.apiUrl}/rsvp/${token}`).subscribe({
      next: (res) => {
        this.details.set(res.data);
        this.selectedStatus.set(res.data.rsvpStatus);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Invalid or expired invitation link');
        this.loading.set(false);
      },
    });
  }

  selectStatus(status: RsvpStatus): void {
    this.selectedStatus.set(status);
  }

  submitRsvp(): void {
    const token = this.route.snapshot.paramMap.get('token');
    const status = this.selectedStatus();
    if (!token || !status) return;

    this.submitting.set(true);
    this.http.post<ApiResponse<any>>(`${environment.apiUrl}/rsvp/${token}/respond`, { status }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => this.submitting.set(false),
    });
  }

  formatEventDate(): string {
    const d = this.details();
    if (!d) return '';
    return new Date(d.eventDate).toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}
