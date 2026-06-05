import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';

/**
 * Componente de callback para OAuth2 con Google.
 * Recibe los datos del usuario como query params desde el backend
 * y guarda la sesión en localStorage.
 */
@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss']
})
export class GoogleCallbackComponent implements OnInit {

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    const token  = params['token'];
    const name   = params['name'];
    const email  = params['email'];
    const role   = params['role'];
    const userId = params['userId'];

    if (!token || !role) {
      this.errorMessage = 'Error al iniciar sesión con Google.';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    // Guardar sesión
    this.authService.saveUserInfo(name, email, role, Number(userId));

    // Redirigir según rol
    if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard-user']);
    }
  }
}
