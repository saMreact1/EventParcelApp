import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';

export interface CoHost {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  permission: string;
  invitedAt: string;
  acceptedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class CoHostService {
  private readonly http = inject(HttpClient);

  listCoHosts(eventId: number): Observable<CoHost[]> {
    return this.http.get<ApiResponse<CoHost[]>>(
      `${environment.apiUrl}/events/${eventId}/co-hosts`
    ).pipe(map(res => res.data));
  }

  addCoHost(eventId: number, email: string, permission = 'VIEW'): Observable<CoHost> {
    return this.http.post<ApiResponse<CoHost>>(
      `${environment.apiUrl}/events/${eventId}/co-hosts`, { email, permission }
    ).pipe(map(res => res.data));
  }

  updatePermission(eventId: number, coHostId: number, permission: string): Observable<CoHost> {
    return this.http.put<ApiResponse<CoHost>>(
      `${environment.apiUrl}/events/${eventId}/co-hosts/${coHostId}`, { permission }
    ).pipe(map(res => res.data));
  }

  removeCoHost(eventId: number, coHostId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.apiUrl}/events/${eventId}/co-hosts/${coHostId}`
    ).pipe(map(() => void 0));
  }
}
