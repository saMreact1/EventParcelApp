import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';
import {
  CreateOrderRequest,
  Order,
  OrderSummary,
  PaginatedResponse,
  OrderStatus,
} from '../models/event';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(this.base, request)
      .pipe(map((res) => res.data));
  }

  getOrder(orderCode: string): Observable<Order> {
    return this.http
      .get<ApiResponse<Order>>(`${this.base}/${orderCode}`)
      .pipe(map((res) => res.data));
  }

  listEventOrders(
    eventId: number,
    page = 0,
    size = 20,
    status?: OrderStatus
  ): Observable<PaginatedResponse<OrderSummary>> {
    let url = `${this.base}/event/${eventId}?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    return this.http
      .get<ApiResponse<PaginatedResponse<OrderSummary>>>(url)
      .pipe(map((res) => res.data));
  }

  listHostOrders(
    page = 0,
    size = 20,
    status?: OrderStatus
  ): Observable<PaginatedResponse<OrderSummary>> {
    let url = `${this.base}/host?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    return this.http
      .get<ApiResponse<PaginatedResponse<OrderSummary>>>(url)
      .pipe(map((res) => res.data));
  }
}
