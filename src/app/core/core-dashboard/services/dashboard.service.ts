import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventByOrganizerResponse, EventUserDetail, GeneralStats, MonthlyGrowthResponse, PlanStatsResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `http://localhost:9000/admin/dashboard`;

  constructor(private http: HttpClient) { }

  getGeneralStats(): Observable<GeneralStats>{
    return this.http.get<GeneralStats>(`${this.apiUrl}/stats`);
  }

  getOrganizersByPlan(startDate?: string, endDate?: string, plan?: string): Observable<PlanStatsResponse> {
  let url = `${this.apiUrl}/plans`;
  const params: string[] = [];

  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (plan) params.push(`plan=${plan}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get<PlanStatsResponse>(url);
}

  getEventsByOrganizer(startDate?: string, endDate?: string, plan?: string): Observable<EventByOrganizerResponse> {
  let url = `${this.apiUrl}/organizers`;
  const params: string[] = [];

  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (plan) params.push(`plan=${plan}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get<EventByOrganizerResponse>(url);
}

  getUserByEvent(): Observable<EventUserDetail[]>{
    return this.http.get<EventUserDetail[]>(`${this.apiUrl}/events/usersByRole`);
  }

  getMonthlyGrowth(startDate?: string, endDate?: string, plan?: string): Observable<MonthlyGrowthResponse> {
  let url = `${this.apiUrl}/growth`;
  const params: string[] = [];

  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (plan) params.push(`plan=${plan}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get<MonthlyGrowthResponse>(url);
}
}