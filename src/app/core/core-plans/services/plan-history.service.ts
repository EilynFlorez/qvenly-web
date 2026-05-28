import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ApiResponse,
  PlanHistoryResponse
} from '../models/plan.model';

/**
 * Servicio para la consulta del historial de planes de un organizador.
 * Permite ver el historial completo de cambios y renovaciones (HU46).
 */
@Injectable({
  providedIn: 'root'
})
export class PlanHistoryService {

  /** URL base del endpoint de historial de planes */
  private apiUrl = `${environment.apiUrl}/api/plan-history`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el historial completo de planes de un organizador (HU46).
   * @param userId ID del organizador
   * @returns Observable con la lista de registros de historial
   */
  getHistoryByUser(userId: number): Observable<ApiResponse<PlanHistoryResponse[]>> {
    return this.http.get<ApiResponse<PlanHistoryResponse[]>>(
      `${this.apiUrl}/user/${userId}`);
  }

  /**
   * Obtiene el historial de una asignación específica (HU46).
   * @param userPlanId ID de la asignación
   * @returns Observable con la lista de registros de historial
   */
  getHistoryByUserPlan(userPlanId: number): Observable<ApiResponse<PlanHistoryResponse[]>> {
    return this.http.get<ApiResponse<PlanHistoryResponse[]>>(
      `${this.apiUrl}/user-plan/${userPlanId}`);
  }
}
