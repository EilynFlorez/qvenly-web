import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
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
    systemNotifications: true,
    accountNotifications: true,
    planNotifications: true,
    silentMode: false
  };

  loading = true;
  editOpen = false;
  savingProfile = false;

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(7)]]
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    if (!this.profile) {
      return 'AP';
    }

    const first = this.profile.name.charAt(0);
    const second = this.profile.lastName.charAt(0);
    return `${first}${second}`.toUpperCase();
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
    if (!this.profile) {
      return;
    }

    this.profileForm.reset({
      name: this.profile.name,
      lastName: this.profile.lastName,
      phoneNumber: this.profile.phoneNumber
    });
    this.editOpen = true;
  }

  closeEditModal(): void {
    if (this.savingProfile) {
      return;
    }

    this.editOpen = false;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const request: UpdateProfileRequest = this.profileForm.getRawValue();
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
    const enabled = !this.preferences.systemNotifications;

    this.updatePreferences({
      ...this.preferences,
      systemNotifications: enabled,
      silentMode: enabled ? false : this.preferences.silentMode
    });
  }

  toggleAccountNotifications(): void {
    const enabled = !this.preferences.accountNotifications;

    this.updatePreferences({
      ...this.preferences,
      accountNotifications: enabled,
      silentMode: enabled ? false : this.preferences.silentMode
    });
  }

  togglePlanNotifications(): void {
    const enabled = !this.preferences.planNotifications;

    this.updatePreferences({
      ...this.preferences,
      planNotifications: enabled,
      silentMode: enabled ? false : this.preferences.silentMode
    });
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
        ...this.preferences,
        silentMode: false
      }
    );
  }

  isInvalid(controlName: keyof UpdateProfileRequest): boolean {
    const control = this.profileForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
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
