import { Component } from '@angular/core';
import { AuthService } from '../../../../core/core-auth/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor ingresa tu correo electrónico.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Te enviamos un correo con instrucciones para restablecer tu contraseña.';
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al enviar el correo';
        this.isLoading = false;
      }
    });
  }
}
