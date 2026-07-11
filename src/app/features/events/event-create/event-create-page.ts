import { Component, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { CoHostService } from '../../../core/services/co-host.service';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker';

@Component({
  selector: 'app-event-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, MapPickerComponent],
  templateUrl: './event-create-page.html',
  styleUrl: './event-create-page.scss',
})
export class EventCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly coHostService = inject(CoHostService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showSuccess = signal(false);
  protected readonly createdEventId = signal<number | null>(null);
  protected readonly showMapPicker = signal(false);
  protected readonly coverPreview = signal<string | null>(null);
  protected coverFile: File | null = null;
  protected selectedLat: number | null = null;
  protected selectedLng: number | null = null;

  protected readonly showCoHostForm = signal(false);
  protected readonly coHostEmail = signal('');
  protected readonly coHostPermission = signal('VIEW');
  protected readonly addingCoHost = signal(false);

  protected readonly eventForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    eventDate: ['', [Validators.required]],
    eventTime: [''],
    venue: ['', [Validators.maxLength(300)]],
    city: ['', [Validators.maxLength(100)]],
    numberOfGroups: [1],
  });

  get titleField() { return this.eventForm.get('title'); }
  get dateField() { return this.eventForm.get('eventDate'); }

  protected openMapPicker(): void {
    this.showMapPicker.set(true);
  }

  protected onLocationSelected(event: { venue: string; city: string; lat: number; lng: number }): void {
    this.eventForm.patchValue({
      venue: event.venue,
      city: event.city,
    });
    this.selectedLat = event.lat;
    this.selectedLng = event.lng;
    this.showMapPicker.set(false);
  }

  protected onMapPickerCancelled(): void {
    this.showMapPicker.set(false);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('Image must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select an image file');
      return;
    }

    this.coverFile = file;
    this.errorMessage.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected removeCoverImage(): void {
    this.coverFile = null;
    this.coverPreview.set(null);
  }

  protected onSubmit(): void {
    if (this.eventForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    if (this.coverFile) {
      this.eventService.uploadCoverImage(this.coverFile).subscribe({
        next: (uploadRes) => this.createEvent(uploadRes.url),
        error: () => {
          this.errorMessage.set('Failed to upload cover image. Please try again.');
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.createEvent(undefined);
    }
  }

  private createEvent(coverImageUrl?: string): void {
    const val = this.eventForm.value;
    this.eventService.createEvent({
      title: val.title!,
      description: val.description || undefined,
      eventDate: val.eventDate!,
      eventTime: val.eventTime || undefined,
      venue: val.venue || undefined,
      city: val.city || undefined,
      latitude: this.selectedLat ?? undefined,
      longitude: this.selectedLng ?? undefined,
      numberOfGroups: val.numberOfGroups || undefined,
      coverImageUrl,
    }).subscribe({
      next: (event) => {
        this.createdEventId.set(event.id);
        this.showSuccess.set(true);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to create event. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected goToGroup(): void {
    this.showSuccess.set(false);
    this.router.navigate(['/dashboard/events', this.createdEventId(), 'groups'], { state: { fromCreation: true } });
  }

  protected goToAddCoHost(): void {
    this.showCoHostForm.set(true);
  }

  protected addCoHost(): void {
    const eventId = this.createdEventId();
    const email = this.coHostEmail().trim();
    if (!eventId || !email) return;
    this.addingCoHost.set(true);
    this.coHostService.addCoHost(eventId, email, this.coHostPermission()).subscribe({
      next: () => {
        this.coHostEmail.set('');
        this.coHostPermission.set('VIEW');
        this.showCoHostForm.set(false);
        this.addingCoHost.set(false);
      },
      error: () => {
        this.addingCoHost.set(false);
      },
    });
  }
}
