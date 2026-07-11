import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { MapPickerComponent } from '../../shared/components/map-picker/map-picker';

@Component({
  selector: 'app-guest-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, MapPickerComponent],
  templateUrl: './guest-checkout-page.html',
  styleUrl: './guest-checkout-page.scss',
})
export class GuestCheckoutPage implements OnInit {
  private static readonly VALID_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'];
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly fb = inject(FormBuilder);

  protected readonly eventCode = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly orderItems: { eventPackageId: number; quantity: number }[] = [];
  protected readonly totalAmount = signal(0);
  protected readonly showMap = signal(false);
  protected readonly cartCurrency = signal('NGN');

  protected readonly checkoutForm = this.fb.group({
    guestName: ['', [Validators.required, Validators.maxLength(150)]],
    guestPhone: ['', [Validators.required, Validators.maxLength(20)]],
    guestEmail: ['', [Validators.email, Validators.maxLength(255)]],
    deliveryAddress: ['', [Validators.required, Validators.maxLength(500)]],
    deliveryCity: ['', [Validators.required, Validators.maxLength(100)]],
    deliveryState: ['', Validators.maxLength(100)],
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    this.eventCode.set(code || '');

    const navigation = this.router.getCurrentNavigation();
    const state = history.state;
    if (state?.items) {
      this.orderItems.push(...state.items);
      this.totalAmount.set(state.totalAmount || 0);
      if (state.currency && GuestCheckoutPage.VALID_CURRENCIES.includes(state.currency)) {
        this.cartCurrency.set(state.currency);
      }
    }

    if (this.orderItems.length === 0) {
      this.router.navigate([`/event/${code}`]);
    }
  }

  protected openMap(): void {
    this.showMap.set(true);
  }

  protected onLocationSelected(location: { venue: string; city: string; lat: number; lng: number }): void {
    this.checkoutForm.patchValue({
      deliveryAddress: location.venue,
      deliveryCity: location.city,
    });
    this.showMap.set(false);
  }

  protected onMapCancelled(): void {
    this.showMap.set(false);
  }

  protected onSubmit(): void {
    if (this.checkoutForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const val = this.checkoutForm.getRawValue();

    this.paymentService.initializePayment({
      eventCode: this.eventCode(),
      guestName: val.guestName || undefined,
      guestPhone: val.guestPhone || undefined,
      guestEmail: val.guestEmail || undefined,
      items: this.orderItems,
      deliveryAddress: val.deliveryAddress || undefined,
      deliveryCity: val.deliveryCity || undefined,
      deliveryState: val.deliveryState || undefined,
    }).subscribe({
      next: (response) => {
        this.paymentService.openPaystackPopup(
          val.guestEmail || 'guest@eventparcel.com',
          this.totalAmount() * 100,
          response.reference,
          this.cartCurrency(),
          (reference) => {
            this.confirmPayment(reference);
          },
          () => {
            this.isSubmitting.set(false);
            this.error.set('Payment was cancelled. Please try again.');
          }
        );
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to initialize payment. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  private confirmPayment(reference: string): void {
    this.paymentService.confirmPayment(reference).subscribe({
      next: (order) => {
        this.router.navigate([`/event/${this.eventCode()}/confirmation`], {
          state: { orderCode: order.orderCode, verified: true },
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Payment confirmation failed. Please contact support.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected goBack(): void {
    this.router.navigate([`/event/${this.eventCode()}`]);
  }

  protected formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: this.cartCurrency(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
