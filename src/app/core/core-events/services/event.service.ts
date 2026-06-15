import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ApiResponse, EventResponse, CreateEventRequest, UpdateEventRequest,
  EventMember, LimitsUsage, AuditLog, EventRole
} from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  getMyEvents(): Observable<ApiResponse<EventResponse[]>> {
    return this.http.get<ApiResponse<EventResponse[]>>(this.apiUrl, { withCredentials: true });
  }

  getEventById(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.get<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createEvent(data: CreateEventRequest): Observable<ApiResponse<EventResponse>> {
    return this.http.post<ApiResponse<EventResponse>>(this.apiUrl, data, { withCredentials: true });
  }

  updateEvent(id: number, data: UpdateEventRequest): Observable<ApiResponse<EventResponse>> {
    return this.http.put<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  publishEvent(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/publish`, {}, { withCredentials: true });
  }

  startEvent(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/start`, {}, { withCredentials: true });
  }

  finishEvent(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/finish`, {}, { withCredentials: true });
  }

  cancelEvent(id: number, cancelReason: string): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/cancel`, { cancelReason }, { withCredentials: true });
  }

  getMembers(id: number): Observable<ApiResponse<EventMember[]>> {
    return this.http.get<ApiResponse<EventMember[]>>(`${this.apiUrl}/${id}/members`, { withCredentials: true });
  }

  getLimits(id: number): Observable<ApiResponse<LimitsUsage>> {
    return this.http.get<ApiResponse<LimitsUsage>>(`${this.apiUrl}/${id}/limits`, { withCredentials: true });
  }

  getAuditLog(id: number): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.apiUrl}/${id}/audit`, { withCredentials: true });
  }

  removeMember(eventId: number, memberId: number, reason: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${eventId}/members/${memberId}`, {
      body: { reason },
      withCredentials: true
    });
  }

  changeMemberRole(eventId: number, memberId: number, newRole: EventRole): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${eventId}/members/${memberId}/role`, { newRole }, { withCredentials: true });
  }

  leaveEvent(eventId: number, reason: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${eventId}/leave`, { reason }, { withCredentials: true });
  }
}
