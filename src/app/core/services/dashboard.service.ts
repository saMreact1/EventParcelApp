import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';

export interface DashboardStats {
  totalOrders: number;
  totalInvites: number;
  totalDelivered: number;
  pendingOrders: number;
  inTransit: number;
  totalEvents: number;
  rsvpGoing: number;
  rsvpMaybe: number;
  rsvpCantGo: number;
  totalRevenue: number;
  totalRevenueUsd: number;
  monthlySales: { month: string; revenue: number }[];
  dailySales: { day: string; revenue: number }[];
  recentOrders: {
    orderCode: string;
    guestName: string;
    totalAmount: number;
    paymentStatus: string;
    deliveryStatus: string;
    createdAt: string;
  }[];
  eventBreakdown: {
    eventId: number;
    eventTitle: string;
    revenue: number;
    orderCount: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.base}/stats`).pipe(map(res => res.data));
  }
}
