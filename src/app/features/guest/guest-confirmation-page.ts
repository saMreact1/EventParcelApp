import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { Order } from '../../core/models/event';

@Component({
  selector: 'app-guest-confirmation-page',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './guest-confirmation-page.html',
  styleUrl: './guest-confirmation-page.scss',
})
export class GuestConfirmationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly verified = signal(false);
  protected readonly polling = signal(false);

  private eventCode = '';

  ngOnInit(): void {
    this.eventCode = this.route.snapshot.paramMap.get('code') || '';
    const state = history.state;
    const orderCode = state?.orderCode;
    this.verified.set(state?.verified || false);

    if (!orderCode) {
      this.router.navigate(['/']);
      return;
    }

    this.loadOrder(orderCode);

    // If not yet verified, poll for verification
    if (!this.verified()) {
      this.pollPayment(orderCode);
    }
  }

  private loadOrder(orderCode: string): void {
    this.orderService.getOrder(orderCode).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        if (order.paymentStatus === 'PAID') {
          this.verified.set(true);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private pollPayment(orderCode: string): void {
    this.polling.set(true);
    let attempts = 0;
    const maxAttempts = 10;

    const check = () => {
      if (attempts >= maxAttempts || this.verified()) {
        this.polling.set(false);
        return;
      }
      attempts++;

      this.paymentService.verifyPayment(orderCode).subscribe({
        next: (result) => {
          if (result.verified) {
            this.verified.set(true);
            this.loadOrder(orderCode);
            this.polling.set(false);
          } else {
            setTimeout(check, 3000);
          }
        },
        error: () => {
          setTimeout(check, 3000);
        },
      });
    };

    setTimeout(check, 3000);
  }

  backToEvent(): void {
    this.router.navigate([`/event/${this.eventCode}`]);
  }
}
