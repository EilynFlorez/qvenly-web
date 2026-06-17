import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ApiResponse,
  ChatResponse,
  CreateSupportTicketRequest,
  HelpCategory,
  HelpCategoryDetail,
  HelpHomeResponse,
  HelpManualResponse,
  HelpManualSection,
  HelpSearchResponse,
  SupportTicketResponse
} from '../models/user-help.model';

@Injectable({
  providedIn: 'root'
})
export class UserHelpService {

  private readonly apiUrl = `${environment.apiUrl}/api/help`;

  constructor(private http: HttpClient) { }

  getHome(): Observable<HelpHomeResponse> {
    return this.http.get<ApiResponse<HelpHomeResponse> | HelpHomeResponse>(`${this.apiUrl}/home`)
      .pipe(map(response => this.unwrap(response)));
  }

  getCategories(): Observable<HelpCategory[]> {
    return this.http.get<ApiResponse<HelpCategory[]> | HelpCategory[]>(`${this.apiUrl}/categories`)
      .pipe(map(response => this.unwrap(response)));
  }

  getCategory(slug: string): Observable<HelpCategoryDetail> {
    return this.http.get<ApiResponse<HelpCategoryDetail> | HelpCategoryDetail>(`${this.apiUrl}/categories/${slug}`)
      .pipe(map(response => this.unwrap(response)));
  }

  getManual(): Observable<HelpManualResponse> {
    return this.http.get<ApiResponse<HelpManualResponse> | HelpManualResponse>(`${this.apiUrl}/manual`)
      .pipe(map(response => this.unwrap(response)));
  }

  getManualSections(): Observable<HelpManualSection[]> {
    return this.http.get<ApiResponse<HelpManualSection[]> | HelpManualSection[]>(`${this.apiUrl}/manual/sections`)
      .pipe(map(response => this.unwrap(response)));
  }

  search(query: string): Observable<HelpSearchResponse> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<HelpSearchResponse> | HelpSearchResponse>(`${this.apiUrl}/search`, { params })
      .pipe(map(response => this.unwrap(response)));
  }

  sendChatMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ApiResponse<ChatResponse> | ChatResponse>(
      `${this.apiUrl}/chat`,
      { message },
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  createSupportTicket(ticket: CreateSupportTicketRequest): Observable<SupportTicketResponse> {
    return this.http.post<ApiResponse<SupportTicketResponse> | SupportTicketResponse>(
      `${this.apiUrl}/support`,
      ticket,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  getMySupportTickets(): Observable<SupportTicketResponse[]> {
    return this.http.get<ApiResponse<SupportTicketResponse[]> | SupportTicketResponse[]>(
      `${this.apiUrl}/support/my`,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  getAdminSupportTickets(): Observable<SupportTicketResponse[]> {
    return this.http.get<ApiResponse<SupportTicketResponse[]> | SupportTicketResponse[]>(
      `${this.apiUrl}/admin/support`,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  getAdminSupportTicket(id: string): Observable<SupportTicketResponse> {
    return this.http.get<ApiResponse<SupportTicketResponse> | SupportTicketResponse>(
      `${this.apiUrl}/admin/support/${id}`,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  respondAdminSupportTicket(id: string, response: string): Observable<SupportTicketResponse> {
    return this.http.post<ApiResponse<SupportTicketResponse> | SupportTicketResponse>(
      `${this.apiUrl}/admin/support/${id}/response`,
      { response },
      { withCredentials: true }
    ).pipe(map(apiResponse => this.unwrap(apiResponse)));
  }

  private unwrap<T>(response: ApiResponse<T> | T): T {
    if (this.isApiResponse(response)) {
      return response.data;
    }

    return response;
  }

  private isApiResponse<T>(response: ApiResponse<T> | T): response is ApiResponse<T> {
    return !!response && typeof response === 'object' && 'data' in response && 'success' in response;
  }
}
