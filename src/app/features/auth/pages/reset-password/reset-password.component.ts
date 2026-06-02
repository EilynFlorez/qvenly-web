import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  token = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showNewPassword = false;
  showConfirmPassword = false;
  touched: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessage = 'Token inválido o expirado.';
    }
  }

  touch(field: string): void {
    this.touched[field] = true;
  }

  getNewPasswordError(): string {
    if (!this.touched['newPassword']) return '';
    const p = this.newPassword;
    if (!p) return 'La contraseña es requerida';
    if (p.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(p)) return 'Debe incluir al menos una mayúscula';
    if (!/[0-9]/.test(p)) return 'Debe incluir al menos un número';
    return '';
  }

  getConfirmPasswordError(): string {
    if (!this.touched['confirmPassword']) return '';
    if (!this.confirmPassword) return 'Confirma tu contraseña';
    if (this.newPassword !== this.confirmPassword) return 'Las contraseñas no coinciden';
    return '';
  }

  fieldState(field: string): 'error' | 'success' | '' {
    if (!this.touched[field]) return '';
    const err = field === 'newPassword'
      ? this.getNewPasswordError()
      : this.getConfirmPasswordError();
    return err ? 'error' : 'success';
  }

  get passwordStrength(): { level: 'weak' | 'medium' | 'strong'; label: string } {
    const p = this.newPassword;
    if (!p) return { level: 'weak', label: '' };
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { level: 'weak',   label: 'Débil' };
    if (score <= 3) return { level: 'medium', label: 'Media' };
    return              { level: 'strong', label: 'Fuerte' };
  }

  onSubmit(): void {
    this.touched['newPassword'] = true;
    this.touched['confirmPassword'] = true;

    if (this.getNewPasswordError() || this.getConfirmPasswordError()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al restablecer la contraseña';
        this.isLoading = false;
      }
    });
  }
}
