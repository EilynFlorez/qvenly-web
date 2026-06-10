import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../models/auth.model';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ConfirmPasswordRequest,
  ConfirmPasswordResponse,
  DeleteProfileRequest,
  NotificationSettings,
  NotificationInbox
} from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = `${environment.apiUrl}/auth/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<UserProfileResponse>> {
    return this.http.get<ApiResponse<UserProfileResponse>>(
      this.apiUrl, { withCredentials: true });
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<UserProfileResponse>> {
    return this.http.put<ApiResponse<UserProfileResponse>>(
      this.apiUrl, request, { withCredentials: true });
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/password`, request, { withCredentials: true });
  }

  confirmPassword(request: ConfirmPasswordRequest): Observable<ApiResponse<ConfirmPasswordResponse>> {
    return this.http.post<ApiResponse<ConfirmPasswordResponse>>(
      `${this.apiUrl}/confirm-password`, request, { withCredentials: true });
  }

  deleteProfile(request: DeleteProfileRequest): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      this.apiUrl, { body: request, withCredentials: true });
  }

  activateNotifications(): Observable<ApiResponse<NotificationSettings>> {
    return this.http.put<ApiResponse<NotificationSettings>>(
      `${this.apiUrl}/notifications/activate`, {}, { withCredentials: true });
  }

  silentNotifications(): Observable<ApiResponse<NotificationSettings>> {
    return this.http.put<ApiResponse<NotificationSettings>>(
      `${this.apiUrl}/notifications/silent`, {}, { withCredentials: true });
  }

  getInbox(): Observable<ApiResponse<NotificationInbox[]>> {
    return this.http.get<ApiResponse<NotificationInbox[]>>(
      `${this.apiUrl}/notifications/inbox`, { withCredentials: true });
  }

  getUnreadInbox(): Observable<ApiResponse<NotificationInbox[]>> {
    return this.http.get<ApiResponse<NotificationInbox[]>>(
      `${this.apiUrl}/notifications/inbox/unread`, { withCredentials: true });
  }

  markAsRead(id: number): Observable<ApiResponse<NotificationInbox>> {
    return this.http.put<ApiResponse<NotificationInbox>>(
      `${this.apiUrl}/notifications/inbox/${id}/read`, {}, { withCredentials: true });
  }
}