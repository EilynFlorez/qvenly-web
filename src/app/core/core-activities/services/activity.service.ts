import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../../core-events/models/event.model';
import {
  ActivityResponse, CreateActivityRequest, UpdateActivityRequest,
  ActivityMember, AssignMemberRequest, ActivityEnrollment,
  QrCodeResponse, AuditLogActivity
} from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/api/activities`;
  private qrUrl  = `${environment.apiUrl}/api/qr`;

  constructor(private http: HttpClient) {}

  // ── Actividades ────────────────────────────────────────────────────────────

  getActivitiesByEvent(eventId: number): Observable<ApiResponse<ActivityResponse[]>> {
    return this.http.get<ApiResponse<ActivityResponse[]>>(
      `${this.apiUrl}/event/${eventId}`, { withCredentials: true }
    );
  }

  getActivityById(id: number): Observable<ApiResponse<ActivityResponse>> {
    return this.http.get<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}`, { withCredentials: true }
    );
  }

  createActivity(data: CreateActivityRequest): Observable<ApiResponse<ActivityResponse>> {
    return this.http.post<ApiResponse<ActivityResponse>>(
      this.apiUrl, data, { withCredentials: true }
    );
  }

  updateActivity(id: number, data: UpdateActivityRequest): Observable<ApiResponse<ActivityResponse>> {
    return this.http.put<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}`, data, { withCredentials: true }
    );
  }

  startActivity(id: number): Observable<ApiResponse<ActivityResponse>> {
    return this.http.patch<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}/start`, {}, { withCredentials: true }
    );
  }

  finishActivity(id: number): Observable<ApiResponse<ActivityResponse>> {
    return this.http.patch<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}/finish`, {}, { withCredentials: true }
    );
  }

  cancelActivity(id: number, cancelReason: string): Observable<ApiResponse<ActivityResponse>> {
    return this.http.patch<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}/cancel`, { cancelReason }, { withCredentials: true }
    );
  }

  getAuditLog(id: number): Observable<ApiResponse<AuditLogActivity[]>> {
    return this.http.get<ApiResponse<AuditLogActivity[]>>(
      `${this.apiUrl}/${id}/audit`, { withCredentials: true }
    );
  }

  // ── Miembros ───────────────────────────────────────────────────────────────

  getMembersByActivity(activityId: number): Observable<ApiResponse<ActivityMember[]>> {
    return this.http.get<ApiResponse<ActivityMember[]>>(
      `${this.apiUrl}/${activityId}/members`, { withCredentials: true }
    );
  }

  assignMember(activityId: number, data: AssignMemberRequest): Observable<ApiResponse<ActivityMember>> {
    return this.http.post<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members`, data, { withCredentials: true }
    );
  }

  removeMember(activityId: number, memberId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${activityId}/members/${memberId}`, { withCredentials: true }
    );
  }

  confirmParticipation(activityId: number): Observable<ApiResponse<ActivityMember>> {
    return this.http.patch<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members/confirm`, {}, { withCredentials: true }
    );
  }

  cancelParticipation(activityId: number, cancelReason: string): Observable<ApiResponse<ActivityMember>> {
    return this.http.patch<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members/cancel`, { cancelReason }, { withCredentials: true }
    );
  }

  // ── Inscripciones ──────────────────────────────────────────────────────────

  getEnrollments(activityId: number): Observable<ApiResponse<ActivityEnrollment[]>> {
    return this.http.get<ApiResponse<ActivityEnrollment[]>>(
      `${this.apiUrl}/${activityId}/enrollments`, { withCredentials: true }
    );
  }

  enroll(activityId: number): Observable<ApiResponse<ActivityEnrollment>> {
    return this.http.post<ApiResponse<ActivityEnrollment>>(
      `${this.apiUrl}/${activityId}/enroll`, {}, { withCredentials: true }
    );
  }

  cancelEnrollment(activityId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${activityId}/enroll`, { withCredentials: true }
    );
  }

  // ── QR ────────────────────────────────────────────────────────────────────

  generateEventQr(eventId: number, eventStartDatetime: string): Observable<ApiResponse<QrCodeResponse>> {
    return this.http.post<ApiResponse<QrCodeResponse>>(
      `${this.qrUrl}/event/${eventId}/generate?eventStartDatetime=${encodeURIComponent(eventStartDatetime)}`,
      {}, { withCredentials: true }
    );
  }

  generateActivityQr(activityId: number): Observable<ApiResponse<QrCodeResponse>> {
    return this.http.post<ApiResponse<QrCodeResponse>>(
      `${this.qrUrl}/activity/${activityId}/generate`,
      {}, { withCredentials: true }
    );
  }
}
