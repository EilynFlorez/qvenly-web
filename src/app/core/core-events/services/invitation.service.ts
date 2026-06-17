import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse, InvitationResponse } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private eventsUrl = `${environment.apiUrl}/api/events`;
  private invitationsUrl = `${environment.apiUrl}/api/invitations`;

  constructor(private http: HttpClient) {}

  getInvitations(eventId: number): Observable<ApiResponse<InvitationResponse[]>> {
    return this.http.get<ApiResponse<InvitationResponse[]>>(`${this.eventsUrl}/${eventId}/invitations`, { withCredentials: true });
  }

  sendInvitation(eventId: number, invitedEmail: string, expiresAt?: string): Observable<ApiResponse<InvitationResponse>> {
    const body: Record<string, string> = { invitedEmail };
    if (expiresAt) body['expiresAt'] = expiresAt;
    return this.http.post<ApiResponse<InvitationResponse>>(
      `${this.eventsUrl}/${eventId}/invitations`,
      body,
      { withCredentials: true }
    );
  }

  sendBulkInvitations(eventId: number, file: File, expiresAt?: string): Observable<ApiResponse<{ sent: any[], failed: any[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (expiresAt) formData.append('expiresAt', expiresAt);
    return this.http.post<ApiResponse<{ sent: any[], failed: any[] }>>(
      `${this.eventsUrl}/${eventId}/invitations/bulk`,
      formData,
      { withCredentials: true }
    );
  }

  cancelInvitation(eventId: number, invitationId: number, cancelReason: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.eventsUrl}/${eventId}/invitations/${invitationId}/cancel`,
      { cancelReason },
      { withCredentials: true }
    );
  }

  previewInvitation(token: string): Observable<ApiResponse<InvitationResponse>> {
    return this.http.get<ApiResponse<InvitationResponse>>(`${this.invitationsUrl}/preview/${token}`);
  }

  getMyPendingInvitations(): Observable<ApiResponse<InvitationResponse[]>> {
    return this.http.get<ApiResponse<InvitationResponse[]>>(`${this.invitationsUrl}/my`, { withCredentials: true });
  }

  acceptInvitation(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.invitationsUrl}/accept/${token}`, {}, { withCredentials: true });
  }
}
