import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse, InvitationResponse, EventRole } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private eventsUrl = `${environment.apiUrl}/api/events`;
  private invitationsUrl = `${environment.apiUrl}/api/invitations`;

  constructor(private http: HttpClient) {}

  getInvitations(eventId: number): Observable<ApiResponse<InvitationResponse[]>> {
    return this.http.get<ApiResponse<InvitationResponse[]>>(`${this.eventsUrl}/${eventId}/invitations`, { withCredentials: true });
  }

  sendInvitation(eventId: number, invitedEmail: string, eventRole: EventRole): Observable<ApiResponse<InvitationResponse>> {
    return this.http.post<ApiResponse<InvitationResponse>>(
      `${this.eventsUrl}/${eventId}/invitations`,
      { invitedEmail, eventRole },
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

  getMyPendingInvitations(): Observable<ApiResponse<InvitationResponse[]>> {
    return this.http.get<ApiResponse<InvitationResponse[]>>(`${this.invitationsUrl}/my`, { withCredentials: true });
  }

  acceptInvitation(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.invitationsUrl}/accept/${token}`, {}, { withCredentials: true });
  }
}
