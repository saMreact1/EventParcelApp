import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';

export interface Delivery {
  id: number;
  orderId: number;
  orderCode: string;
  eventTitle: string;
  guestName: string;
  guestPhone: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  status: string;
  trackingCode: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  createdAt: string;
}

export interface CreateDeliveryRequest {
  address: string;
  city: string;
  state?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly http = inject(HttpClient);

  listDeliveries(eventId: number, page = 0, size = 20, status?: string): Observable<{ content: Delivery[]; totalElements: number }> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<{ content: Delivery[]; totalElements: number }>>(
      `${environment.apiUrl}/events/${eventId}/deliveries`, { params }
    ).pipe(map(res => res.data));
  }

  createDelivery(eventId: number, orderId: number, data: CreateDeliveryRequest): Observable<Delivery> {
    return this.http.post<ApiResponse<Delivery>>(
      `${environment.apiUrl}/events/${eventId}/deliveries`, data, { params: { orderId: orderId.toString() } }
    ).pipe(map(res => res.data));
  }

  getDelivery(eventId: number, deliveryId: number): Observable<Delivery> {
    return this.http.get<ApiResponse<Delivery>>(
      `${environment.apiUrl}/events/${eventId}/deliveries/${deliveryId}`
    ).pipe(map(res => res.data));
  }

  updateStatus(eventId: number, deliveryId: number, status: string): Observable<Delivery> {
    return this.http.put<ApiResponse<Delivery>>(
      `${environment.apiUrl}/events/${eventId}/deliveries/${deliveryId}/status`, { status }
    ).pipe(map(res => res.data));
  }

  trackByCode(trackingCode: string): Observable<Delivery> {
    return this.http.get<ApiResponse<Delivery>>(
      `${environment.apiUrl}/deliveries/track/${trackingCode}`
    ).pipe(map(res => res.data));
  }

  bulkCreateDeliveries(eventId: number, orderIds: number[]): Observable<Delivery[]> {
    return this.http.post<ApiResponse<Delivery[]>>(
      `${environment.apiUrl}/events/${eventId}/deliveries/bulk`, { orderIds }
    ).pipe(map(res => res.data));
  }
}
