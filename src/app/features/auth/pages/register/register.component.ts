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

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  fieldErrors: { [key: string]: string } = {};
  showPassword = false;
  showConfirmPassword = false;

  // Control de campos tocados (para no mostrar errores antes de que el usuario escriba)
  touched: { [key: string]: boolean } = {};

  constructor(private authService: AuthService, private router: Router) {}

  // ─── Marcar campo como tocado ─────────────────────────────────────────
  touch(field: string): void {
    this.touched[field] = true;
  }

  // ─── Validaciones individuales ────────────────────────────────────────
  getNameError(): string {
    if (!this.touched['name']) return '';
    if (!this.registerData.name) return 'El nombre es requerido';
    if (this.registerData.name.trim().length < 2) return 'Mínimo 2 caracteres';
    return '';
  }

  getLastNameError(): string {
    if (!this.touched['lastName']) return '';
    if (!this.registerData.lastName) return 'El apellido es requerido';
    if (this.registerData.lastName.trim().length < 2) return 'Mínimo 2 caracteres';
    return '';
  }

  getEmailError(): string {
    if (!this.touched['email']) return '';
    if (!this.registerData.email) return 'El correo es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) return 'Ingresa un correo válido';
    return '';
  }

  getDocumentError(): string {
    if (!this.touched['documentNumber']) return '';
    if (!this.registerData.documentNumber) return 'El número de documento es requerido';
    if (!/^\d+$/.test(this.registerData.documentNumber)) return 'Solo se permiten números';
    return '';
  }

  getPhoneError(): string {
    if (!this.touched['phoneNumber']) return '';
    if (!this.registerData.phoneNumber) return 'El teléfono es requerido';
    if (!/^\+?[\d\s\-]{7,15}$/.test(this.registerData.phoneNumber)) return 'Formato inválido (ej: +573001234567)';
    return '';
  }

  getPasswordError(): string {
    if (!this.touched['password']) return '';
    const p = this.registerData.password;
    if (!p) return 'La contraseña es requerida';
    if (p.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(p)) return 'Debe incluir al menos una mayúscula';
    if (!/[0-9]/.test(p)) return 'Debe incluir al menos un número';
    return '';
  }

  getConfirmPasswordError(): string {
    if (!this.touched['confirmPassword']) return '';
    if (!this.confirmPassword) return 'Confirma tu contraseña';
    if (this.registerData.password !== this.confirmPassword) return 'Las contraseñas no coinciden';
    return '';
  }

  // ─── Estado del campo (para clases CSS) ──────────────────────────────
  fieldState(field: string): 'error' | 'success' | '' {
    if (!this.touched[field]) return '';
    switch (field) {
      case 'password':
        return this.getPasswordError() ? 'error' : 'success';
      case 'confirmPassword':
        return this.getConfirmPasswordError() ? 'error' : 'success';
      default:
        return this.getFieldError(field) ? 'error' : '';
    }
  }

  private getFieldError(field: string): string {
    switch (field) {
      case 'name':           return this.getNameError();
      case 'lastName':       return this.getLastNameError();
      case 'email':          return this.getEmailError();
      case 'documentNumber': return this.getDocumentError();
      case 'phoneNumber':    return this.getPhoneError();
      case 'password':       return this.getPasswordError();
      case 'confirmPassword':return this.getConfirmPasswordError();
      default:               return '';
    }
  }

  // ─── Fortaleza de contraseña ──────────────────────────────────────────
  get passwordStrength(): { level: 'weak' | 'medium' | 'strong'; label: string } {
    const p = this.registerData.password;
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

  // ─── Submit ───────────────────────────────────────────────────────────
  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    ['name','lastName','email','documentNumber','phoneNumber','password','confirmPassword']
      .forEach(f => this.touched[f] = true);

    const hasErrors = [
      this.getNameError(), this.getLastNameError(), this.getEmailError(),
      this.getDocumentError(), this.getPhoneError(),
      this.getPasswordError(), this.getConfirmPasswordError()
    ].some(e => e !== '');

    if (hasErrors) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.';
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
