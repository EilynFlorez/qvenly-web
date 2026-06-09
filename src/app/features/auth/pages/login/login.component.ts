import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { LoginRequest } from '../../../../core/core-auth/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginData: LoginRequest = {
    email: '',
    password: '',
    rememberMe: false
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  touched: { [key: string]: boolean } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const confirmed = this.route.snapshot.queryParamMap.get('confirmed');
    const error     = this.route.snapshot.queryParamMap.get('error');

    if (confirmed === 'true') {
      this.successMessage = 'Cuenta confirmada exitosamente. Ya puedes iniciar sesión.';
    }

    // Error enviado por OAuth2SuccessHandler cuando hay conflicto de proveedores
    if (error === 'email_registered_locally') {
      this.errorMessage = 'Este correo ya está registrado con usuario y contraseña. ' +
                          'Inicia sesión con tus credenciales.';
    }
  }

  touch(field: string): void {
    this.touched[field] = true;
  }

  getEmailError(): string {
    if (!this.touched['email']) return '';
    if (!this.loginData.email) return 'El correo es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) return 'Ingresa un correo válido';
    return '';
  }

  getPasswordError(): string {
    if (!this.touched['password']) return '';
    if (!this.loginData.password) return 'La contraseña es requerida';
    if (this.loginData.password.length < 8) return 'Mínimo 8 caracteres';
    return '';
  }

  onSubmit(): void {
    this.touched['email'] = true;
    this.touched['password'] = true;

    if (this.getEmailError() || this.getPasswordError()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.saveUserInfo(
            response.data.name,
            response.data.email,
            response.data.role,
            response.data.userId
          );
          const role = response.data.role;
          if (role === 'ADMIN') {
            this.router.navigate(['/dashboard']);
          } else if (role === 'USER') {
            this.router.navigate(['/dashboard-user']);
          } else {
            this.errorMessage = 'Rol no reconocido';
          }
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al iniciar sesión';
        this.isLoading = false;
      }
    });
  }

  onGoogleLogin(): void {
    window.location.href = 'http://localhost:9000/oauth2/authorization/google';
  }
}