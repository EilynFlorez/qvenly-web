import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  NotificationPreferences,
  UpdateProfileRequest,
  UserProfile
} from '../../../../core/core-profile/models/profile.model';
import { ProfileService } from '../../../../core/core-profile/services/profile.service';

@Component({
  selector: 'app-profile-management',
  templateUrl: './profile-management.component.html',
  styleUrl: './profile-management.component.scss'
})
export class ProfileManagementComponent implements OnInit {
  profile: UserProfile | null = null;
  preferences: NotificationPreferences = {
    systemNotifications: false,
    accountNotifications: false,
    planNotifications: false,
    silentMode: false
  };

  loading = true;
  editOpen = false;
  savingProfile = false;

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    if (!this.profile) {
      return 'AP';
    }

    return `${this.profile.name.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
  }

  get roleLabel(): string {
    if (!this.profile) {
      return 'Administrador';
    }

    return this.profile.role === 'ADMIN' ? 'Administrador' : 'Usuario';
  }

  loadProfile(): void {
    this.loading = true;

    forkJoin({
      profile: this.profileService.getProfile(),
      preferences: this.profileService.getNotificationPreferences()
    }).subscribe({
      next: ({ profile, preferences }) => {
        this.profile = profile;
        this.preferences = preferences;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openEditModal(): void {
    this.editOpen = true;
  }

  closeEditModal(): void {
    if (!this.savingProfile) {
      this.editOpen = false;
    }
  }

  saveProfile(request: UpdateProfileRequest): void {
    this.savingProfile = true;

    this.profileService.updateProfile(request).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.savingProfile = false;
        this.editOpen = false;
      },
      error: () => {
        this.savingProfile = false;
      }
    });
  }

  toggleSystemNotifications(): void {
    this.toggleGlobalNotifications(!this.preferences.systemNotifications);
  }

  toggleAccountNotifications(): void {
    this.toggleGlobalNotifications(!this.preferences.accountNotifications);
  }

  togglePlanNotifications(): void {
    this.toggleGlobalNotifications(!this.preferences.planNotifications);
  }

  toggleSilentMode(): void {
    const enabled = !this.preferences.silentMode;

    this.updatePreferences(enabled
      ? {
        systemNotifications: false,
        accountNotifications: false,
        planNotifications: false,
        silentMode: true
      }
      : {
        systemNotifications: false,
        accountNotifications: false,
        planNotifications: false,
        silentMode: false
      }
    );
  }

  private toggleGlobalNotifications(enabled: boolean): void {
    this.updatePreferences({
      systemNotifications: enabled,
      accountNotifications: enabled,
      planNotifications: enabled,
      silentMode: false
    });
  }

  private updatePreferences(preferences: NotificationPreferences): void {
    this.preferences = preferences;
    this.profileService.updateNotificationPreferences(preferences).subscribe({
      next: (updatedPreferences) => {
        this.preferences = updatedPreferences;
      }
    });
  }
}