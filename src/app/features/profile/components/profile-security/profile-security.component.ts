import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangePasswordRequest, DeleteProfileRequest, SessionSecurityInfo } from '../../../../core/core-profile/models/profile.model';
import { ProfileService } from '../../../../core/core-profile/services/profile.service';

@Component({
  selector: 'app-profile-security',
  templateUrl: './profile-security.component.html',
  styleUrl: './profile-security.component.scss'
})
export class ProfileSecurityComponent implements OnInit {
  sessionInfo: SessionSecurityInfo = {
    device: 'Cargando...',
    ipAddress: 'Cargando...',
    startedAt: 'Cargando...'
  };

  savingPassword = false;
  passwordSaved = false;
  logoutRequested = false;
  deletionRequested = false;
  deletingProfile = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  showDeletePassword = false;

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  deleteForm = this.fb.group({
    password: ['', [Validators.required]]
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.profileService.getSessionSecurityInfo().subscribe({
      next: (sessionInfo) => {
        this.sessionInfo = sessionInfo;
      }
    });
  }

  get passwordMismatch(): boolean {
    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    return Boolean(confirmPassword && newPassword !== confirmPassword);
  }

  changePassword(): void {
    this.passwordSaved = false;

    if (this.passwordForm.invalid || this.passwordMismatch) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const request: ChangePasswordRequest = this.passwordForm.getRawValue();
    this.savingPassword = true;

    this.profileService.changePassword(request).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.passwordSaved = true;
        this.savingPassword = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.savingPassword = false;
      }
    });
  }

  logoutSession(): void {
    this.profileService.logoutCurrentSession().subscribe({
      next: () => {
        this.logoutRequested = true;
        this.router.navigate(['/auth/login']);
      }
    });
  }

  requestDeleteProfile(): void {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    const request: DeleteProfileRequest = this.deleteForm.getRawValue();
    this.deletingProfile = true;

    this.profileService.requestProfileDeletion(request).subscribe({
      next: () => {
        this.deletionRequested = true;
        this.deletingProfile = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.deletingProfile = false;
      }
    });
  }

  isPasswordInvalid(controlName: keyof ChangePasswordRequest): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isDeletePasswordInvalid(): boolean {
    const control = this.deleteForm.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }
}