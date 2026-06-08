import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, UserPlanRequest, UserPlanResponse } from '../models/plan.model';
import { Observable } from 'rxjs';


/**
 * Servicio para la gestión de planes asignados a organizadores.
 * Maneja la asignación, adquisición y renovación de planes (HU42, HU43).
 */
@Injectable({
  providedIn: 'root'
})
export class UserPlanService {

  /** URL base del endpoint de planes asignados */
  private apiUrl = `${environment.apiUrl}/api/user-plans`;

  constructor(private http: HttpClient) {}

  /**
   * Asigna un plan a un organizador específico (HU42).
   * Solo puede ser ejecutado por un administrador.
   */
  assignPlanByAdmin(request: UserPlanRequest): Observable<ApiResponse<UserPlanResponse>> {
    return this.http.post<ApiResponse<UserPlanResponse>>(
      `${this.apiUrl}/assign`, request, { withCredentials: true });
  }

  /**
   * Permite a un organizador adquirir su propio plan (HU42).
   */
  acquirePlanByOrganizer(request: UserPlanRequest): Observable<ApiResponse<UserPlanResponse>> {
    return this.http.post<ApiResponse<UserPlanResponse>>(
      `${this.apiUrl}/acquire`, request, { withCredentials: true });
  }

  /**
   * Renueva el plan asignado a un organizador (HU43).
   */
  renewPlan(userPlanId: number): Observable<ApiResponse<UserPlanResponse>> {
    return this.http.put<ApiResponse<UserPlanResponse>>(
      `${this.apiUrl}/${userPlanId}/renew`, {}, { withCredentials: true });
  }

  /**
   * Obtiene el plan activo de un organizador específico.
   */
  getActivePlanByUser(userId: number): Observable<ApiResponse<UserPlanResponse>> {
    return this.http.get<ApiResponse<UserPlanResponse>>(
      `${this.apiUrl}/user/${userId}/active`, { withCredentials: true });
  }
}