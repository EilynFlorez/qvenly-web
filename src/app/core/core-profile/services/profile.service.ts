import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../core-auth/services/auth.service';
import {
  ApiResponse,
  BackendSessionSecurityInfo,
  BackendUpdateProfileRequest,
  BackendUserProfile,
  ChangePasswordRequest,
  DeleteProfileRequest,
  NotificationPreferences,
  NotificationSettingsResponse,
  SessionSecurityInfo,
  UpdateProfileRequest,
  UserProfile
} from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly profileUrl = `${environment.apiUrl}/auth/profile`;
  private readonly notificationsUrl = `${this.profileUrl}/notifications`;
  private currentProfile: UserProfile | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<BackendUserProfile>>(
      this.profileUrl,
      { withCredentials: true }
    ).pipe(
      map((response) => this.mapProfile(this.requireData(response))),
      tap((profile) => {
        this.currentProfile = profile;
        this.authService.saveUserInfo(profile.fullName, profile.email, profile.role, profile.id);
      })
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    const payload = this.buildUpdatePayload(request);

    return this.http.put<ApiResponse<BackendUserProfile>>(
      this.profileUrl,
      payload,
      { withCredentials: true }
    ).pipe(
      map((response) => this.mapProfile(this.requireData(response))),
      tap((profile) => {
        this.currentProfile = profile;
        this.authService.saveUserInfo(profile.fullName, profile.email, profile.role, profile.id);
      })
    );
  }

  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.http.get<ApiResponse<NotificationSettingsResponse>>(
      this.notificationsUrl,
      { withCredentials: true }
    ).pipe(
      map((response) => this.mapNotificationSettings(this.requireData(response)))
    );
  }

  updateNotificationPreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    if (preferences.silentMode) {
      return this.http.put<ApiResponse<NotificationSettingsResponse>>(
        `${this.notificationsUrl}/silent`,
        {},
        { withCredentials: true }
      ).pipe(map((response) => this.mapNotificationSettings(this.requireData(response))));
    }

    const shouldEnable = preferences.systemNotifications
      || preferences.accountNotifications
      || preferences.planNotifications;

    const endpoint = shouldEnable ? 'activate' : 'disable';
    return this.http.put<ApiResponse<NotificationSettingsResponse>>(
      `${this.notificationsUrl}/${endpoint}`,
      {},
      { withCredentials: true }
    ).pipe(map((response) => this.mapNotificationSettings(this.requireData(response))));
  }

  getSessionSecurityInfo(): Observable<SessionSecurityInfo> {
    return this.http.get<ApiResponse<BackendSessionSecurityInfo>>(
      `${this.profileUrl}/session`,
      { withCredentials: true }
    ).pipe(
      map((response) => this.mapSessionInfo(this.requireData(response)))
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(
      `${this.profileUrl}/password`,
      request,
      { withCredentials: true }
    ).pipe(
      tap(() => this.authService.clearSession()),
      map(() => void 0)
    );
  }

  logoutCurrentSession(): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${environment.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.authService.clearSession()),
      map(() => void 0)
    );
  }

  requestProfileDeletion(request: DeleteProfileRequest): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      this.profileUrl,
      {
        body: request,
        withCredentials: true
      }
    ).pipe(
      tap(() => this.authService.clearSession()),
      map(() => void 0)
    );
  }

  private buildUpdatePayload(request: UpdateProfileRequest): BackendUpdateProfileRequest {
    if (!this.currentProfile) {
      throw new Error('No hay perfil cargado para conservar los campos obligatorios.');
    }

    return {
      ...request,
      email: this.currentProfile.email,
      documentType: this.currentProfile.documentType,
      documentNumber: this.currentProfile.documentNumber
    };
  }

  private mapProfile(profile: BackendUserProfile): UserProfile {
    return {
      id: profile.id,
      name: profile.name,
      lastName: profile.lastName,
      fullName: profile.fullName || `${profile.name} ${profile.lastName}`.trim(),
      email: profile.email,
      phoneNumber: profile.phoneNumber || '',
      role: profile.role,
      roles: profile.roles || [],
      documentType: profile.documentType || '',
      documentNumber: profile.documentNumber || '',
      createdAt: profile.createdAt,
      memberSince: this.formatMonthYear(profile.createdAt),
      lastAccess: this.formatRelativeDate(profile.lastAccess)
    };
  }

  private mapNotificationSettings(settings: NotificationSettingsResponse): NotificationPreferences {
    const enabled = Boolean(settings.notificationsEnabled && !settings.silentMode);

    return {
      systemNotifications: enabled,
      accountNotifications: enabled,
      planNotifications: enabled,
      silentMode: Boolean(settings.notificationsEnabled && settings.silentMode)
    };
  }

  private mapSessionInfo(session: BackendSessionSecurityInfo): SessionSecurityInfo {
    return {
      device: session.device || 'Dispositivo no identificado',
      ipAddress: session.ipAddress || 'No disponible',
      startedAt: this.formatDateTime(session.startedAt)
    };
  }

  private requireData<T>(response: ApiResponse<T>): T {
    if (!response.success || response.data === undefined || response.data === null) {
      throw new Error(response.message || 'Respuesta invalida del servidor');
    }
    return response.data;
  }

  private formatMonthYear(value?: string): string {
    if (!value) {
      return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-CO', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(value));
  }

  private formatRelativeDate(value?: string): string {
    if (!value) {
      return 'No disponible';
    }

    const date = new Date(value);
    const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

    if (diffMinutes < 1) {
      return 'Ahora';
    }
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }
    if (diffMinutes < 1440) {
      return `Hace ${Math.round(diffMinutes / 60)} h`;
    }

    return this.formatDateTime(value);
  }

  private formatDateTime(value?: string): string {
    if (!value) {
      return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }
}