import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker';

@Component({
  selector: 'app-event-edit-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MapPickerComponent],
  templateUrl: './event-edit-page.html',
  styleUrl: './event-edit-page.scss',
})
export class EventEditPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly showMapPicker = signal(false);
  protected readonly coverPreview = signal<string | null>(null);
  protected coverFile: File | null = null;
  protected existingCoverUrl: string | null = null;
  protected selectedLat: number | null = null;
  protected selectedLng: number | null = null;
  protected eventId!: number;

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

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId) {
      this.router.navigate(['/dashboard/events']);
      return;
    }
    this.loadEvent();
  }

  private loadEvent(): void {
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        this.eventForm.patchValue({
          title: event.title,
          description: event.description || '',
          eventDate: event.eventDate,
          eventTime: event.eventTime || '',
          venue: event.venue || '',
          city: event.city || '',
          numberOfGroups: event.numberOfGroups || 1,
        });
        if (event.coverImageUrl) {
          this.existingCoverUrl = event.coverImageUrl;
          this.coverPreview.set(event.coverImageUrl);
        }
        this.selectedLat = event.latitude || null;
        this.selectedLng = event.longitude || null;
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/dashboard/events']),
    });
  }

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
    this.existingCoverUrl = null;
    this.errorMessage.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected removeCoverImage(): void {
    this.coverFile = null;
    this.existingCoverUrl = null;
    this.coverPreview.set(null);
  }

  protected onSubmit(): void {
    if (this.eventForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    if (this.coverFile) {
      this.eventService.uploadCoverImage(this.coverFile).subscribe({
        next: (uploadRes) => this.updateEvent(uploadRes.url),
        error: () => {
          this.errorMessage.set('Failed to upload cover image. Please try again.');
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.updateEvent(this.existingCoverUrl ?? undefined);
    }
  }

  private updateEvent(coverImageUrl?: string): void {
    const val = this.eventForm.value;
    this.eventService.updateEvent(this.eventId, {
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
      next: () => {
        this.router.navigate(['/dashboard/events', this.eventId]);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update event. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }
}
