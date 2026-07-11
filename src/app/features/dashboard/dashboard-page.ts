import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { SalesChart, ChartDataPoint } from '../../shared/components/chart/sales-chart';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { AuthStore } from '../../core/stores/auth.store';

type OrderTab = 'all' | 'pending' | 'shipped' | 'completed';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [FormsModule, SalesChart],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly notificationService = inject(NotificationService);
  private readonly authStore = inject(AuthStore);

  protected readonly loading = signal(true);
  protected readonly activeTab = signal<OrderTab>('all');
  protected readonly searchQuery = signal('');
  protected readonly pageSize = signal(6);
  protected readonly currentPage = signal(1);
  protected readonly salesFilter = signal('Monthly');
  protected readonly salesFilters = ['Monthly', 'Daily'];
  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly showNotifications = signal(false);
  protected readonly deliveryMap = signal<Map<string, string>>(new Map());

  protected readonly notifications = this.notificationService.notifications;
  protected readonly unreadCount = this.notificationService.unreadCount;

  protected readonly tabs: { id: OrderTab; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'completed', label: 'Completed' },
  ];

  protected readonly chartData = computed(() => {
    const s = this.stats();
    if (!s) return [];
    if (this.salesFilter() === 'Daily') {
      return s.dailySales.map(d => ({ label: d.day, value: Number(d.revenue) }));
    }
    return s.monthlySales.map(m => ({ label: m.month, value: Number(m.revenue) }));
  });

  protected readonly statCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Events', value: s?.totalEvents ?? 0, icon: 'events' },
      { label: 'Orders', value: s?.totalOrders ?? 0, icon: 'orders' },
      { label: 'Invited', value: s?.totalInvites ?? 0, icon: 'invites' },
      { label: 'Going', value: s?.rsvpGoing ?? 0, icon: 'going' },
      { label: 'Maybe', value: s?.rsvpMaybe ?? 0, icon: 'maybe' },
      { label: 'Delivered', value: s?.totalDelivered ?? 0, icon: 'delivered' },
    ];
  });

  protected readonly recentOrders = computed(() => {
    const s = this.stats();
    const dMap = this.deliveryMap();
    if (!s) return [];
    return s.recentOrders.map(order => ({
      ...order,
      deliveryStatus: dMap.get(order.orderCode) ?? '',
    }));
  });

  protected readonly totalRevenue = computed(() => {
    const s = this.stats();
    return s?.totalRevenue ?? 0;
  });

  protected readonly eventBreakdown = computed(() => {
    const s = this.stats();
    return s?.eventBreakdown ?? [];
  });

  ngOnInit(): void {
    this.loadStats();
    this.connectNotifications();
  }

  private loadStats(): void {
    this.dashboardService.getStats().pipe(
      switchMap(stats => {
        const eventIds = stats.eventBreakdown.map(e => e.eventId);
        if (eventIds.length === 0) {
          return of({ stats, deliveries: new Map<string, string>() });
        }
        const deliveryRequests = eventIds.map(eventId =>
          this.deliveryService.listDeliveries(eventId, 0, 100).pipe(
            map(res => res.content)
          )
        );
        return forkJoin(deliveryRequests).pipe(
          map(deliveryArrays => {
            const map = new Map<string, string>();
            for (const deliveries of deliveryArrays) {
              for (const d of deliveries) {
                map.set(d.orderCode, d.status);
              }
            }
            return { stats, deliveries: map };
          })
        );
      })
    ).subscribe({
      next: ({ stats, deliveries }) => {
        this.stats.set(stats);
        this.deliveryMap.set(deliveries);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private connectNotifications(): void {
    const user = this.authStore.user();
    if (user?.id) {
      this.notificationService.connect(user.id);
    }
  }

  protected toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.notificationService.markAllRead();
    }
  }

  protected dismissNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.dismiss(id);
  }

  protected setTab(id: OrderTab): void {
    this.activeTab.set(id);
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  }

  protected statusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'bg-emerald-50 text-emerald-700',
      PENDING: 'bg-amber-50 text-amber-700',
      CANCELLED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected deliveryStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-600',
      PICKED_UP: 'bg-blue-50 text-blue-700',
      IN_TRANSIT: 'bg-amber-50 text-amber-700',
      DELIVERED: 'bg-emerald-50 text-emerald-700',
      RETURNED: 'bg-red-50 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
