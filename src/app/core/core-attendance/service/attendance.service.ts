import { Injectable } from '@angular/core';
import { ApiResponse, AttendanceResponse, QrResponse } from '../models/attendance.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // ── QR ──────────────────────────────────────────────────────────────────────

  /** Genera o recupera el QR del usuario autenticado para un evento. */
  getEventQr(eventId: number): Observable<ApiResponse<QrResponse>> {
    return this.http.get<ApiResponse<QrResponse>>(
      `${this.apiUrl}/qr/event/${eventId}`, { withCredentials: true }
    );
  }

  /** Genera o recupera el QR del usuario autenticado para una actividad. */
  getActivityQr(activityId: number): Observable<ApiResponse<QrResponse>> {
    return this.http.get<ApiResponse<QrResponse>>(
      `${this.apiUrl}/qr/activity/${activityId}`, { withCredentials: true }
    );
  }

  // ── Asistencia ──────────────────────────────────────────────────────────────

  /** Escanea un QR (por token) y registra la asistencia. */
  scan(token: string): Observable<ApiResponse<AttendanceResponse>> {
    return this.http.post<ApiResponse<AttendanceResponse>>(
      `${this.apiUrl}/attendance/scan`, { token }, { withCredentials: true }
    );
  }

  /** Lista la asistencia registrada de un evento. */
  getEventAttendance(eventId: number): Observable<ApiResponse<AttendanceResponse[]>> {
    return this.http.get<ApiResponse<AttendanceResponse[]>>(
      `${this.apiUrl}/attendance/event/${eventId}`, { withCredentials: true }
    );
  }

  /** Lista la asistencia registrada de una actividad. */
  getActivityAttendance(activityId: number): Observable<ApiResponse<AttendanceResponse[]>> {
    return this.http.get<ApiResponse<AttendanceResponse[]>>(
      `${this.apiUrl}/attendance/activity/${activityId}`, { withCredentials: true }
    );
  }
}
