import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';

export interface BankInfo {
  name: string;
  code: string;
  longcode: string;
  gateway: string;
  payWithBank: string;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface ResolveAccountResponse {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/banks`;

  listBanks(): Observable<BankInfo[]> {
    return this.http.get<ApiResponse<BankInfo[]>>(this.base).pipe(map(res => res.data));
  }

  resolveAccount(accountNumber: string, bankCode: string): Observable<ResolveAccountResponse> {
    return this.http.post<ApiResponse<ResolveAccountResponse>>(`${this.base}/resolve`, {
      accountNumber,
      bankCode,
    }).pipe(map(res => res.data));
  }
}
