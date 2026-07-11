import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';
import { InitializePaymentResponse, Order } from '../models/event';

declare var PaystackPop: any;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/payments`;

  initializePayment(data: {
    eventCode: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    items: { eventPackageId: number; quantity: number }[];
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryState?: string;
    deliveryPhone?: string;
  }): Observable<InitializePaymentResponse> {
    return this.http
      .post<ApiResponse<InitializePaymentResponse>>(`${this.base}/initialize`, data)
      .pipe(map((res) => res.data));
  }

  confirmPayment(reference: string): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(`${this.base}/${reference}/confirm`, {})
      .pipe(map((res) => res.data));
  }

  verifyPayment(reference: string): Observable<{ verified: boolean; message: string }> {
    return this.http
      .get<ApiResponse<{ verified: boolean; message: string }>>(`${this.base}/${reference}/verify`)
      .pipe(map((res) => res.data));
  }

  openPaystackPopup(
    email: string,
    amountInKobo: number,
    ref: string,
    currency: string,
    onSuccess: (reference: string) => void,
    onClose: () => void
  ): void {
    if (typeof PaystackPop === 'undefined') {
      console.error('Paystack SDK not loaded');
      return;
    }

    const handler = PaystackPop.setup({
      key: environment.paystackPublicKey,
      email,
      amount: amountInKobo,
      ref,
      currency: currency || 'NGN',
      callback: (response: any) => {
        onSuccess(response.reference);
      },
      onClose: () => {
        onClose();
      },
    });

    handler.openIframe();
  }
}
