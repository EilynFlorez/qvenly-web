import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PlanFilter, PlanRequest, PlanResponse } from '../models/plan.model';


/**
 * Servicio para la gestión de planes de servicio.
 * Maneja las operaciones CRUD de planes (HU36 - HU41).
 */
@Injectable({
  providedIn: 'root'
})
export class PlanService {

  /** URL base del endpoint de planes */
  private apiUrl = `${environment.apiUrl}/api/plans`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de planes registrados (HU37).
   * @returns Observable con la lista de planes
   */
  getAllPlans(): Observable<ApiResponse<PlanResponse[]>> {
    return this.http.get<ApiResponse<PlanResponse[]>>(this.apiUrl);
  }

  /**
   * Obtiene el detalle completo de un plan específico (HU39).
   * @param id Identificador del plan
   * @returns Observable con los datos del plan
   */
  getPlanById(id: number): Observable<ApiResponse<PlanResponse>> {
    return this.http.get<ApiResponse<PlanResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Filtra planes combinando múltiples criterios (HU38).
   * Todos los filtros son opcionales y se pueden combinar.
   * @param filters Criterios de búsqueda
   * @returns Observable con la lista de planes filtrados
   */
  filterPlans(filters: PlanFilter): Observable<ApiResponse<PlanResponse[]>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    return this.http.get<ApiResponse<PlanResponse[]>>(`${this.apiUrl}/filter`, { params });
  }

  /**
   * Crea un nuevo plan de servicio (HU36).
   * Requiere rol ADMIN.
   * @param plan Datos del plan a crear
   * @returns Observable con el plan creado
   */
  createPlan(plan: PlanRequest): Observable<ApiResponse<PlanResponse>> {
    return this.http.post<ApiResponse<PlanResponse>>(this.apiUrl, plan, { withCredentials: true });
  }

  /**
   * Actualiza los datos de un plan existente (HU40).
   * Requiere rol ADMIN.
   * @param id Identificador del plan a actualizar
   * @param plan Nuevos datos del plan
   * @returns Observable con el plan actualizado
   */
  updatePlan(id: number, plan: PlanRequest): Observable<ApiResponse<PlanResponse>> {
    return this.http.put<ApiResponse<PlanResponse>>(`${this.apiUrl}/${id}`, plan, { withCredentials: true });
  }

  /**
 * Elimina lógicamente un plan del sistema (HU41).
 * Solo se puede eliminar si no está asignado a ningún organizador.
 * Requiere rol ADMIN.
 * @param id Identificador del plan a eliminar
 * @param reason Motivo de la eliminación
 * @returns Observable con la confirmación de eliminación
 */
  deletePlan(id: number, reason: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}?reason=${reason}`, { withCredentials: true });
  }
}