import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ApiResponse,
  PlanAuditResponse
} from '../models/plan.model';

/**
 * Servicio para la consulta de la bitácora de auditoría de planes.
 * Permite al administrador consultar las acciones realizadas sobre los planes (HU48).
 */
@Injectable({
  providedIn: 'root'
})
export class PlanAuditService {

  /** URL base del endpoint de auditoría de planes */
  private apiUrl = `${environment.apiUrl}/api/plan-audit`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la auditoría de acciones realizadas sobre un plan (HU48).
   * Requiere rol ADMIN.
   * @param planId ID del plan
   * @returns Observable con la lista de registros de auditoría
   */
  getAuditByPlan(planId: number): Observable<ApiResponse<PlanAuditResponse[]>> {
    return this.http.get<ApiResponse<PlanAuditResponse[]>>(
      `${this.apiUrl}/plan/${planId}`);
  }

  /**
   * Obtiene la auditoría filtrada por tipo de acción (HU48).
   * Requiere rol ADMIN.
   * @param action Tipo de acción a filtrar
   * @returns Observable con la lista de registros de auditoría
   */
  getAuditByAction(action: string): Observable<ApiResponse<PlanAuditResponse[]>> {
    return this.http.get<ApiResponse<PlanAuditResponse[]>>(
      `${this.apiUrl}/action/${action}`);
  }

  /**
   * Obtiene la auditoría dentro de un rango de fechas (HU48).
   * Requiere rol ADMIN.
   * @param startDate Fecha inicial del rango en formato ISO
   * @param endDate Fecha final del rango en formato ISO
   * @returns Observable con la lista de registros de auditoría
   */
  getAuditByDateRange(startDate: string, endDate: string): Observable<ApiResponse<PlanAuditResponse[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<PlanAuditResponse[]>>(
      `${this.apiUrl}/date-range`, { params });
  }
}
