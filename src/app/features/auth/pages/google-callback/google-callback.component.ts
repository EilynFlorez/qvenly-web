import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';

/**
 * Componente de callback para OAuth2 con Google.
 *
 * Lee los query params enviados por OAuth2SuccessHandler:
 * - name, email, role, userId — datos no sensibles para la UI
 * - needsProfile — indica si el usuario debe completar su perfil
 *
 * Si needsProfile=true redirige a /auth/complete-profile
 * Si no, redirige al dashboard según el rol
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

    const name         = params['name'];
    const email        = params['email'];
    const role         = params['role'];
    const userId       = params['userId'];
    const needsProfile = params['needsProfile'] === 'true';

    if (!role || !email) {
      this.errorMessage = 'Error al iniciar sesión con Google.';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    // Guardar datos no sensibles en localStorage
    this.authService.saveUserInfo(name || 'Usuario', email, role, Number(userId));

    // Si el perfil está incompleto, redirigir al formulario
    if (needsProfile) {
      this.router.navigate(['/auth/complete-profile']);
      return;
    }

    // Redirigir según rol
    if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard-user']);
    }
  }
}