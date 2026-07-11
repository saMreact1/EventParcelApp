import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/user';
import {
  EventSummary, EventDetail, CreateEventRequest, UpdateEventRequest,
  Guest, AddGuestRequest, UpdateGuestRequest, GuestStats, PaginatedResponse,
  EventGroup, EventPackage, CreateGroupRequest, CreatePackageRequest,
  PaymentSetup, CreatePaymentSetupRequest,
  PickupDetails, CreatePickupDetailsRequest,
} from '../models/event';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/events`;

  // ── Events ──

  listEvents(page = 0, size = 10, status?: string): Observable<PaginatedResponse<EventSummary>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PaginatedResponse<EventSummary>>>(this.base, { params }).pipe(
      map(res => res.data),
    );
  }

  getEvent(id: number): Observable<EventDetail> {
    return this.http.get<ApiResponse<EventDetail>>(`${this.base}/${id}`).pipe(map(res => res.data));
  }

  getEventByCode(code: string): Observable<EventDetail> {
    return this.http.get<ApiResponse<EventDetail>>(`${this.base}/by-code/${code}`).pipe(map(res => res.data));
  }

  createEvent(data: CreateEventRequest): Observable<EventDetail> {
    return this.http.post<ApiResponse<EventDetail>>(this.base, data).pipe(map(res => res.data));
  }

  updateEvent(id: number, data: UpdateEventRequest): Observable<EventDetail> {
    return this.http.put<ApiResponse<EventDetail>>(`${this.base}/${id}`, data).pipe(map(res => res.data));
  }

  cancelEvent(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(map(() => void 0));
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}/permanent`).pipe(map(() => void 0));
  }

  cloneEvent(id: number): Observable<EventDetail> {
    return this.http.post<ApiResponse<EventDetail>>(`${this.base}/${id}/clone`, {}).pipe(map(res => res.data));
  }

  // ── Upload ──

  uploadCoverImage(file: File): Observable<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ url: string; publicId: string }>>(
      `${environment.apiUrl}/upload`, formData,
    ).pipe(map(res => res.data));
  }

  // ── Groups ──

  listGroups(eventId: number): Observable<EventGroup[]> {
    return this.http.get<ApiResponse<EventGroup[]>>(`${this.base}/${eventId}/groups`).pipe(map(res => res.data));
  }

  createGroup(eventId: number, data: CreateGroupRequest): Observable<EventGroup> {
    return this.http.post<ApiResponse<EventGroup>>(`${this.base}/${eventId}/groups`, data).pipe(map(res => res.data));
  }

  updateGroup(eventId: number, groupId: number, data: CreateGroupRequest): Observable<EventGroup> {
    return this.http.put<ApiResponse<EventGroup>>(`${this.base}/${eventId}/groups/${groupId}`, data).pipe(map(res => res.data));
  }

  deleteGroup(eventId: number, groupId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${eventId}/groups/${groupId}`).pipe(map(() => void 0));
  }

  // ── Packages ──

  listPackages(eventId: number, groupId: number): Observable<EventPackage[]> {
    return this.http.get<ApiResponse<EventPackage[]>>(`${this.base}/${eventId}/groups/${groupId}/packages`).pipe(map(res => res.data));
  }

  createPackage(eventId: number, groupId: number, data: CreatePackageRequest): Observable<EventPackage> {
    return this.http.post<ApiResponse<EventPackage>>(`${this.base}/${eventId}/groups/${groupId}/packages`, data).pipe(map(res => res.data));
  }

  updatePackage(eventId: number, groupId: number, packageId: number, data: CreatePackageRequest): Observable<EventPackage> {
    return this.http.put<ApiResponse<EventPackage>>(`${this.base}/${eventId}/groups/${groupId}/packages/${packageId}`, data).pipe(map(res => res.data));
  }

  deletePackage(eventId: number, groupId: number, packageId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${eventId}/groups/${groupId}/packages/${packageId}`).pipe(map(() => void 0));
  }

  // ── Payment Setup ──

  getPaymentSetup(eventId: number): Observable<PaymentSetup> {
    return this.http.get<ApiResponse<PaymentSetup>>(`${this.base}/${eventId}/payment-setup`).pipe(map(res => res.data));
  }

  savePaymentSetup(eventId: number, data: CreatePaymentSetupRequest): Observable<PaymentSetup> {
    return this.http.post<ApiResponse<PaymentSetup>>(`${this.base}/${eventId}/payment-setup`, data).pipe(map(res => res.data));
  }

  // ── Pickup Details ──

  getPickupDetails(eventId: number): Observable<PickupDetails> {
    return this.http.get<ApiResponse<PickupDetails>>(`${this.base}/${eventId}/pickup-details`).pipe(map(res => res.data));
  }

  savePickupDetails(eventId: number, data: CreatePickupDetailsRequest): Observable<PickupDetails> {
    return this.http.post<ApiResponse<PickupDetails>>(`${this.base}/${eventId}/pickup-details`, data).pipe(map(res => res.data));
  }

  // ── Guests ──

  private guestsBase(eventId: number): string {
    return `${this.base}/${eventId}/guests`;
  }

  listGuests(eventId: number, page = 0, size = 20, search?: string): Observable<PaginatedResponse<Guest>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<PaginatedResponse<Guest>>>(this.guestsBase(eventId), { params }).pipe(map(res => res.data));
  }

  addGuest(eventId: number, data: AddGuestRequest): Observable<Guest> {
    return this.http.post<ApiResponse<Guest>>(this.guestsBase(eventId), data).pipe(map(res => res.data));
  }

  removeGuest(eventId: number, guestId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.guestsBase(eventId)}/${guestId}`).pipe(map(() => void 0));
  }

  getGuestStats(eventId: number): Observable<GuestStats> {
    return this.http.get<ApiResponse<GuestStats>>(`${this.guestsBase(eventId)}/stats`).pipe(map(res => res.data));
  }

  sendInvitation(eventId: number, guestId: number): Observable<Guest> {
    return this.http.post<ApiResponse<Guest>>(`${this.guestsBase(eventId)}/${guestId}/send-invitation`, {}).pipe(map(res => res.data));
  }

  sendBulkInvitations(eventId: number, guestIds: number[]): Observable<Guest[]> {
    return this.http.post<ApiResponse<Guest[]>>(`${this.guestsBase(eventId)}/bulk-invitations`, { guestIds }).pipe(map(res => res.data));
  }

  sendAllInvitations(eventId: number): Observable<Guest[]> {
    return this.http.post<ApiResponse<Guest[]>>(`${this.guestsBase(eventId)}/all-invitations`, {}).pipe(map(res => res.data));
  }

  bulkImportGuests(eventId: number, guests: { fullName: string; email?: string; phone?: string }[]): Observable<{ imported: number; skipped: number; errors: string[] }> {
    return this.http.post<ApiResponse<{ imported: number; skipped: number; errors: string[] }>>(
      `${this.guestsBase(eventId)}/bulk-import`, { guests },
    ).pipe(map(res => res.data));
  }
}