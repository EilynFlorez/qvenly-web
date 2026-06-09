import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  NotificationPreferences,
  UpdateProfileRequest,
  UserProfile
} from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileSnapshot: UserProfile = this.buildProfileSnapshot();

  private preferencesSnapshot: NotificationPreferences = {
    systemNotifications: true,
    accountNotifications: true,
    planNotifications: true,
    silentMode: false
  };

  // TODO: consumir endpoint a traves del API Gateway.
  getProfile(): Observable<UserProfile> {
    return of({ ...this.profileSnapshot }).pipe(delay(250));
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    this.profileSnapshot = {
      ...this.profileSnapshot,
      ...request,
      fullName: `${request.name} ${request.lastName}`.trim()
    };

    localStorage.setItem('name', this.profileSnapshot.fullName);

    return of({ ...this.profileSnapshot }).pipe(delay(250));
  }

  // TODO: consumir preferencias a traves del API Gateway.
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return of({ ...this.preferencesSnapshot }).pipe(delay(180));
  }

  // TODO: persistir esta regla de preferencias mediante el API Gateway cuando el endpoint este disponible.
  updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Observable<NotificationPreferences> {
    this.preferencesSnapshot = { ...preferences };
    return of({ ...this.preferencesSnapshot }).pipe(delay(180));
  }

  private buildProfileSnapshot(): UserProfile {
    const storedName = localStorage.getItem('name') || 'Admin Principal';
    const storedEmail = localStorage.getItem('email') || 'admin@qvenly.com';
    const storedRole = localStorage.getItem('role') || 'ADMIN';
    const storedUserId = Number(localStorage.getItem('userId')) || 1;
    const [name, ...lastNameParts] = storedName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Principal';

    return {
      id: storedUserId,
      name: name || 'Admin',
      lastName,
      fullName: storedName,
      email: storedEmail,
      phoneNumber: '+57 300 000 0000',
      role: storedRole,
      memberSince: 'Enero 2025',
      lastAccess: 'Hoy, hace 2 min'
    };
  }
}
