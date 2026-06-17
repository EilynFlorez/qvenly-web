import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../models/plan.model';
import { NotificationInbox } from '../../core-auth/models/profile.model';

/**
 * Servicio para consultar las notificaciones generadas por el microservicio de planes.
 */
@Injectable({
  providedIn: 'root'
})
export class PlanNotificationService {

  /** URL base del endpoint de notificaciones de planes */
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las notificaciones de planes del usuario autenticado.
   */
  getNotifications(): Observable<ApiResponse<NotificationInbox[]>> {
    return this.http.get<ApiResponse<NotificationInbox[]>>(
      this.apiUrl, { withCredentials: true });
  }

  /**
   * Marca una notificación de planes como leída.
   * @param id ID de la notificación
   */
  markAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/${id}/read`, {}, { withCredentials: true });
  }
}