import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { Order } from '../../core/models/event';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './order-detail-page.html',
  styleUrl: './order-detail-page.scss',
})
export class OrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly deliveryService = inject(DeliveryService);

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly shipping = signal(false);

  ngOnInit(): void {
    const orderCode = this.route.snapshot.paramMap.get('orderCode');
    if (orderCode) {
      this.loadOrder(orderCode);
    }
  }

  private loadOrder(orderCode: string): void {
    this.loading.set(true);
    this.orderService.getOrder(orderCode).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/orders']);
  }

  protected shipOrder(): void {
    const o = this.order();
    if (!o) return;
    this.shipping.set(true);
    this.deliveryService.createDelivery(o.eventId, o.id, {
      address: o.deliveryAddress || '',
      city: o.deliveryCity || '',
      state: o.deliveryState || '',
      phone: o.guestPhone,
    }).subscribe({
      next: () => {
        this.order.update(ord => ord ? { ...ord } : ord);
        this.shipping.set(false);
        this.loadOrder(o.orderCode);
      },
      error: () => {
        this.shipping.set(false);
      },
    });
  }

  protected statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      PAID: 'Paid',
      FAILED: 'Failed',
      REFUNDED: 'Refunded',
      CANCELLED: 'Cancelled',
    };
    return map[status] ?? status;
  }

  protected statusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'bg-emerald-50 text-emerald-700',
      PENDING: 'bg-amber-50 text-amber-700',
      FAILED: 'bg-red-50 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-600',
      CANCELLED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected get guestInitials(): string {
    const name = this.order()?.guestName || 'G';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected get itemCount(): number {
    return this.orderItems().length;
  }

  protected orderItems() {
    const o = this.order();
    if (!o) return [];
    return o.items || [];
  }

  protected itemGradient(index: number): string {
    const gradients = [
      'bg-gradient-to-br from-[#8B1A1A] to-[#5D0E0E]',
      'bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44]',
      'bg-gradient-to-br from-emerald-500 to-emerald-700',
      'bg-gradient-to-br from-amber-500 to-amber-700',
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-purple-500 to-purple-700',
    ];
    return gradients[index % gradients.length];
  }
}
