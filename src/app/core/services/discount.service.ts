import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';

export interface Discount {
  id: number;
  eventId: number;
  eventTitle: string;
  code: string;
  type: string;
  value: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly http = inject(HttpClient);

  listDiscounts(eventId: number): Observable<Discount[]> {
    return this.http.get<ApiResponse<Discount[]>>(
      `${environment.apiUrl}/events/${eventId}/discounts`
    ).pipe(map(res => res.data));
  }

  createDiscount(eventId: number, data: { code: string; type: string; value: number; maxUses?: number; expiresAt?: string }): Observable<Discount> {
    return this.http.post<ApiResponse<Discount>>(
      `${environment.apiUrl}/events/${eventId}/discounts`, data
    ).pipe(map(res => res.data));
  }

  updateDiscount(eventId: number, discountId: number, data: { code: string; type: string; value: number; maxUses?: number; expiresAt?: string }): Observable<Discount> {
    return this.http.put<ApiResponse<Discount>>(
      `${environment.apiUrl}/events/${eventId}/discounts/${discountId}`, data
    ).pipe(map(res => res.data));
  }

  toggleActive(eventId: number, discountId: number): Observable<Discount> {
    return this.http.patch<ApiResponse<Discount>>(
      `${environment.apiUrl}/events/${eventId}/discounts/${discountId}/toggle`, {}
    ).pipe(map(res => res.data));
  }

  deleteDiscount(eventId: number, discountId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.apiUrl}/events/${eventId}/discounts/${discountId}`
    ).pipe(map(() => void 0));
  }

  validateDiscount(eventId: number, code: string, orderAmount: number): Observable<{ valid: boolean; discountAmount: number; finalAmount: number; message: string }> {
    return this.http.post<ApiResponse<any>>(
      `${environment.apiUrl}/events/${eventId}/discounts/validate`, { code, orderAmount }
    ).pipe(map(res => res.data));
  }
}
