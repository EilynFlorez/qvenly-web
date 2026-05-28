import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { RegisterRequest } from '../../../../core/core-auth/models/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerData: RegisterRequest = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    documentNumber: '',
    documentType: 'CC',
    phoneNumber: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  fieldErrors: { [key: string]: string } = {};

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '📧 Registro exitoso. Revisa tu correo para confirmar tu cuenta.';
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (err.error?.data) {
          this.fieldErrors = err.error.data;
        } else {
          this.errorMessage = err.error?.message || 'Error al registrarse';
        }
        this.isLoading = false;
      }
    });
  }
}
