import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-pickup-details-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pickup-details-page.html',
  styleUrl: './pickup-details-page.scss',
})
export class PickupDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly fb = inject(FormBuilder);

  protected readonly eventId = signal<number>(0);
  protected readonly isSubmitting = signal(false);

  protected readonly pickupForm = this.fb.group({
    contactName: ['', [Validators.required]],
    contactPhone: ['', [Validators.required]],
    pickupLocation: [''],
    state: [''],
    city: [''],
    pickupStartDate: ['', [Validators.required]],
    pickupStartTime: ['', [Validators.required]],
    timezone: ['WAT'],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('eventId'));
    this.eventId.set(id);
  }

  protected onSubmit(): void {
    if (this.pickupForm.invalid) return;
    this.isSubmitting.set(true);
    const val = this.pickupForm.value;
    this.eventService.savePickupDetails(this.eventId(), {
      contactName: val.contactName || undefined,
      contactPhone: val.contactPhone || undefined,
      pickupLocation: val.pickupLocation || undefined,
      state: val.state || undefined,
      city: val.city || undefined,
      pickupStartDate: val.pickupStartDate || undefined,
      pickupStartTime: val.pickupStartTime || undefined,
      timezone: val.timezone || undefined,
    }).subscribe({
      next: () => { this.router.navigate(['/dashboard/events', this.eventId()]); this.isSubmitting.set(false); },
      error: () => this.isSubmitting.set(false),
    });
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/events', this.eventId(), 'payment-setup']);
  }
}