import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';
import {
  TransactionSummary,
  TransactionStats,
  PaginatedResponse,
} from '../models/event';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/transactions`;

  getStats(): Observable<TransactionStats> {
    return this.http
      .get<ApiResponse<TransactionStats>>(`${this.base}/stats`)
      .pipe(map((res) => res.data));
  }

  listTransactions(
    page = 0,
    size = 6,
    search?: string
  ): Observable<PaginatedResponse<TransactionSummary>> {
    let url = `${this.base}?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http
      .get<ApiResponse<PaginatedResponse<TransactionSummary>>>(url)
      .pipe(map((res) => res.data));
  }
}
