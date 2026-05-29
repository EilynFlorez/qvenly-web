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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const confirmed = this.route.snapshot.queryParamMap.get('confirmed');
    if (confirmed === 'true') {
      this.successMessage = 'Cuenta confirmada exitosamente. Ya puedes iniciar sesión.';
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.saveUserInfo(
            response.data.name,
            response.data.email,
            response.data.role
          );
          // Redirigir según el rol
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
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }
}
