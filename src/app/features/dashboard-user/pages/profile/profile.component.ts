import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { ProfileService } from '../../../../core/core-auth/services/profile.service';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '../../../../core/core-auth/models/profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // ── Estado general ────────────────────────────────────────────────────
  profile: UserProfileResponse | null = null;
  loading = true;
  activeTab: 'datos' | 'seguridad' = 'datos';

  // ── Formulario datos personales ───────────────────────────────────────
  editForm: UpdateProfileRequest = {
    name: '', lastName: '', email: '',
    phoneNumber: '', documentType: '', documentNumber: ''
  };
  originalForm: UpdateProfileRequest = { ...this.editForm };
  savingProfile = false;
  profileMessage = '';
  profileError = '';

  // ── Formulario contraseña ─────────────────────────────────────────────
  passwordForm: ChangePasswordRequest = {
    currentPassword: '', newPassword: '', confirmPassword: ''
  };
  savingPassword = false;
  passwordMessage = '';
  passwordError = '';

  // ── Visibilidad de campos ─────────────────────────────────────────────
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // ── Control de campos tocados ─────────────────────────────────────────
  touched: { [key: string]: boolean } = {};

  documentTypes = ['CC', 'CE', 'PASSPORT', 'TI'];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile = res.data;
        this.editForm = {
          name: res.data.name,
          lastName: res.data.lastName,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber || '',
          documentType: res.data.documentType || '',
          documentNumber: res.data.documentNumber || ''
        };
        this.originalForm = { ...this.editForm };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setTab(tab: 'datos' | 'seguridad'): void {
    this.activeTab = tab;
    this.profileMessage = '';
    this.profileError = '';
    this.passwordMessage = '';
    this.passwordError = '';
    this.touched = {};
  }

  // ── Marcar campo como tocado ──────────────────────────────────────────
  touch(field: string): void {
    this.touched[field] = true;
  }

  // ── Validaciones del formulario de contraseña ─────────────────────────
  getCurrentPasswordError(): string {
    if (!this.touched['currentPassword']) return '';
    if (!this.passwordForm.currentPassword) return 'La contraseña actual es requerida';
    return '';
  }

  getNewPasswordError(): string {
    if (!this.touched['newPassword']) return '';
    const p = this.passwordForm.newPassword;
    if (!p) return 'La nueva contraseña es requerida';
    if (p.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(p)) return 'Debe incluir al menos una mayúscula';
    if (!/[0-9]/.test(p)) return 'Debe incluir al menos un número';
    if (!/[^A-Za-z0-9]/.test(p)) return 'Debe incluir al menos un carácter especial';
    return '';
  }

  getConfirmPasswordError(): string {
    if (!this.touched['confirmPassword']) return '';
    if (!this.passwordForm.confirmPassword) return 'Confirma tu contraseña';
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) return 'Las contraseñas no coinciden';
    return '';
  }

  // ── Estado visual del campo ───────────────────────────────────────────
  fieldState(field: string): 'error' | 'success' | '' {
    if (!this.touched[field]) return '';
    switch (field) {
      case 'currentPassword': return this.getCurrentPasswordError() ? 'error' : 'success';
      case 'newPassword':     return this.getNewPasswordError()     ? 'error' : 'success';
      case 'confirmPassword': return this.getConfirmPasswordError() ? 'error' : 'success';
      default: return '';
    }
  }

  // ── Fortaleza de la contraseña ────────────────────────────────────────
  get passwordStrength(): { level: 'weak' | 'medium' | 'strong'; label: string } {
    const p = this.passwordForm.newPassword;
    if (!p) return { level: 'weak', label: '' };
    let score = 0;
    if (p.length >= 8)          score++;
    if (p.length >= 12)         score++;
    if (/[A-Z]/.test(p))        score++;
    if (/[0-9]/.test(p))        score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { level: 'weak',   label: 'Débil' };
    if (score <= 3) return { level: 'medium', label: 'Media' };
    return                 { level: 'strong', label: 'Fuerte' };
  }

  // ── Datos personales ──────────────────────────────────────────────────
  hasChanges(): boolean {
    return (Object.keys(this.editForm) as (keyof UpdateProfileRequest)[])
      .some(k => this.editForm[k] !== this.originalForm[k]);
  }

  saveProfile(): void {
    this.profileMessage = '';
    this.profileError = '';

    if (!this.hasChanges()) {
      this.profileMessage = 'No has realizado ningún cambio.';
      return;
    }

    this.savingProfile = true;
    this.profileService.updateProfile(this.editForm).subscribe({
      next: (res) => {
        this.profile = res.data;
        this.originalForm = { ...this.editForm };
        this.profileMessage = 'Perfil actualizado exitosamente.';
        this.savingProfile = false;
      },
      error: (err) => {
        this.profileError = err?.error?.message || 'Error al actualizar el perfil.';
        this.savingProfile = false;
      }
    });
  }

  // ── Contraseña ────────────────────────────────────────────────────────
  changePassword(): void {
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(f => this.touched[f] = true);

    if (this.getCurrentPasswordError() || this.getNewPasswordError() || this.getConfirmPasswordError()) {
      return;
    }

    this.savingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';

    this.profileService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.passwordMessage = 'Contraseña actualizada. Cerrando sesión...';
        this.savingPassword = false;
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.touched = {};
        setTimeout(() => {
          this.authService.clearSession();
          window.location.href = '/auth/login';
        }, 2000);
      },
      error: (err) => {
        this.passwordError = err?.error?.message || 'Error al cambiar la contraseña.';
        this.savingPassword = false;
      }
    });
  }

  isGoogleUser(): boolean {
    return this.profile?.authProvider === 'GOOGLE';
  }

  getInitials(): string {
    if (!this.profile) return '';
    return `${this.profile.name.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
  }
}
