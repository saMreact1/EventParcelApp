import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { EventGroup, EventPackage } from '../../../core/models/event';

@Component({
  selector: 'app-event-groups-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-groups-page.html',
  styleUrl: './event-groups-page.scss',
})
export class EventGroupsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly fb = inject(FormBuilder);

  protected readonly eventId = signal<number>(0);
  protected readonly groups = signal<EventGroup[]>([]);
  protected readonly numberOfGroups = signal<number>(0);
  protected readonly fromCreation = signal(false);
  protected readonly loading = signal(true);
  protected readonly showGroupForm = signal(false);
  protected readonly showPackageForm = signal(false);
  protected readonly selectedGroupId = signal<number | null>(null);
  private static readonly VALID_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'];
  protected readonly selectedCurrency = signal('NGN');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Edit state
  protected readonly editingGroup = signal<EventGroup | null>(null);
  protected readonly editingPackage = signal<EventPackage | null>(null);

  // Share state
  protected readonly eventCode = signal('');
  protected readonly copiedGroupId = signal<number | null>(null);

  // Package image
  protected readonly packageImagePreview = signal<string | null>(null);
  protected packageImageFile: File | null = null;

  protected readonly groupForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    currency: ['NGN'],
    privacy: ['GENERAL'],
  });

  protected readonly packageForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    price: [null as number | null, [Validators.required]],
    quantity: [null as number | null],
    deliveryType: ['PLATFORM'],
    packageSize: ['Small Box'],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('eventId'));
    this.eventId.set(id);
    this.fromCreation.set(history.state?.fromCreation === true);
    this.loadEvent();
    this.loadGroups();
  }

  protected get canAddGroup(): boolean {
    return this.groups().length < this.numberOfGroups();
  }

  protected get hostReceives(): number {
    const price = this.packageForm.get('price')?.value || 0;
    const fee = price * 0.035;
    const thresholds: Record<string, { flatFee: number; threshold: number }> = {
      NGN: { flatFee: 100, threshold: 2500 },
      USD: { flatFee: 1, threshold: 5 },
    };
    const t = thresholds[this.selectedCurrency()] || thresholds['NGN'];
    const flatFee = price >= t.threshold ? t.flatFee : 0;
    return Math.max(0, Math.round(price - fee - flatFee));
  }

  protected get isPlatformDelivery(): boolean {
    return this.packageForm.get('deliveryType')?.value === 'PLATFORM';
  }

  protected get currencySymbol(): string {
    const map: Record<string, string> = { NGN: '\u20A6', USD: '$' };
    return map[this.selectedCurrency()] || '\u20A6';
  }

  protected formatPrice(amount: number, currency?: string): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || this.selectedCurrency(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  protected onPackageImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) return;
    if (!file.type.startsWith('image/')) return;

    this.packageImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.packageImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected removePackageImage(): void {
    this.packageImageFile = null;
    this.packageImagePreview.set(null);
  }

  protected loadGroups(): void {
    this.loading.set(true);
    this.eventService.listGroups(this.eventId()).subscribe({
      next: (groups) => { this.groups.set(groups); this.loading.set(false); },
      error: () => { this.groups.set([]); this.loading.set(false); },
    });
  }

  private loadEvent(): void {
    this.eventService.getEvent(this.eventId()).subscribe({
      next: (event) => {
        this.numberOfGroups.set(event.numberOfGroups || 0);
        this.eventCode.set(event.eventCode);
      },
      error: () => this.numberOfGroups.set(0),
    });
  }

  protected createGroup(): void {
    if (this.groupForm.invalid) return;
    this.isSubmitting.set(true);
    const val = this.groupForm.value;
    const data = {
      name: val.name!,
      description: val.description || undefined,
      currency: val.currency || undefined,
      privacy: val.privacy || 'GENERAL',
    };

    const editGroup = this.editingGroup();
    if (editGroup) {
      this.eventService.updateGroup(this.eventId(), editGroup.id, data).subscribe({
        next: () => { this.loadGroups(); this.closeGroupForm(); this.isSubmitting.set(false); },
        error: () => this.isSubmitting.set(false),
      });
    } else {
      this.eventService.createGroup(this.eventId(), data).subscribe({
        next: () => { this.loadGroups(); this.closeGroupForm(); this.isSubmitting.set(false); },
        error: () => this.isSubmitting.set(false),
      });
    }
  }

  protected openEditGroupForm(group: EventGroup): void {
    this.editingGroup.set(group);
    this.groupForm.patchValue({
      name: group.name,
      description: group.description,
      currency: group.currency,
      privacy: group.privacy,
    });
    this.showGroupForm.set(true);
  }

  protected closeGroupForm(): void {
    this.showGroupForm.set(false);
    this.editingGroup.set(null);
    this.groupForm.reset({ currency: 'NGN', privacy: 'GENERAL' });
  }

  protected openPackageForm(groupId: number): void {
    this.editingPackage.set(null);
    const group = this.groups().find(g => g.id === groupId);
    this.selectedGroupId.set(groupId);
    const currency = group?.currency || 'NGN';
    this.selectedCurrency.set(
      EventGroupsPage.VALID_CURRENCIES.includes(currency) ? currency : 'NGN'
    );
    this.showPackageForm.set(true);
    this.packageForm.reset({ deliveryType: 'PLATFORM', packageSize: 'Small Box', quantity: null, price: null });
    this.packageImageFile = null;
    this.packageImagePreview.set(null);
  }

  protected openEditPackageForm(group: EventGroup, pkg: EventPackage): void {
    this.editingPackage.set(pkg);
    this.selectedGroupId.set(group.id);
    const currency = group.currency || 'NGN';
    this.selectedCurrency.set(
      EventGroupsPage.VALID_CURRENCIES.includes(currency) ? currency : 'NGN'
    );
    this.packageForm.patchValue({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      quantity: pkg.quantity,
      deliveryType: pkg.deliveryType || 'PLATFORM',
      packageSize: pkg.packageSize || 'Small Box',
    });
    this.packageImagePreview.set(pkg.imageUrl || null);
    this.packageImageFile = null;
    this.showPackageForm.set(true);
  }

  protected closePackageForm(): void {
    this.showPackageForm.set(false);
    this.editingPackage.set(null);
    this.packageForm.reset({ deliveryType: 'PLATFORM', packageSize: 'Small Box', quantity: null, price: null });
    this.packageImageFile = null;
    this.packageImagePreview.set(null);
  }

  protected createPackage(): void {
    if (this.packageForm.invalid || !this.selectedGroupId()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const val = this.packageForm.value;

    if (this.packageImageFile) {
      this.eventService.uploadCoverImage(this.packageImageFile).subscribe({
        next: (uploadRes) => this.submitPackage(val, uploadRes.url),
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to upload image. Please try again.');
          this.isSubmitting.set(false);
        },
      });
    } else {
      const existingImageUrl = this.editingPackage()?.imageUrl;
      this.submitPackage(val, existingImageUrl || undefined);
    }
  }

  private submitPackage(val: any, imageUrl?: string): void {
    const groupId = this.selectedGroupId()!;
    const data = {
      name: val.name!,
      description: val.description || undefined,
      price: val.price!,
      quantity: val.quantity || undefined,
      deliveryType: val.deliveryType || 'PLATFORM',
      packageSize: val.deliveryType === 'PLATFORM' ? (val.packageSize || undefined) : undefined,
      imageUrl,
    };

    const editPkg = this.editingPackage();
    if (editPkg) {
      this.eventService.updatePackage(this.eventId(), groupId, editPkg.id, data).subscribe({
        next: () => { this.loadGroups(); this.closePackageForm(); this.isSubmitting.set(false); },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to update package. Please try again.');
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.eventService.createPackage(this.eventId(), groupId, data).subscribe({
        next: () => { this.loadGroups(); this.closePackageForm(); this.isSubmitting.set(false); },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to create package. Please try again.');
          this.isSubmitting.set(false);
        },
      });
    }
  }

  protected deleteGroup(groupId: number): void {
    this.eventService.deleteGroup(this.eventId(), groupId).subscribe({
      next: () => this.loadGroups(),
    });
  }

  protected deletePackage(groupId: number, packageId: number): void {
    this.eventService.deletePackage(this.eventId(), groupId, packageId).subscribe({
      next: () => this.loadGroups(),
    });
  }

  protected goToPayment(): void {
    if (this.fromCreation()) {
      this.router.navigate(['/dashboard/events', this.eventId(), 'payment-setup']);
    } else {
      this.router.navigate(['/dashboard/events', this.eventId()]);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/events', this.eventId()]);
  }

  protected copyGroupShareLink(group: EventGroup): void {
    const code = this.eventCode();
    if (!code) return;
    const url = `${window.location.origin}/event/${code}?group=${group.id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copiedGroupId.set(group.id);
      setTimeout(() => this.copiedGroupId.set(null), 2000);
    });
  }
}