import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';

/**
 * Componente de callback para OAuth2 con Google.
 *
 * El backend ya NO manda el token en la URL (era un riesgo de seguridad).
 * Ahora el token llega como cookie HttpOnly establecida por OAuth2SuccessHandler.
 * Este componente solo recibe los datos no sensibles como query params:
 * name, email, role, userId — y guarda la sesión en localStorage.
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

    const name   = params['name'];
    const email  = params['email'];
    const role   = params['role'];
    const userId = params['userId'];

    // Validar que llegaron los datos mínimos necesarios
    if (!role || !email) {
      this.errorMessage = 'Error al iniciar sesión con Google.';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    // Guardar datos no sensibles en localStorage para personalizar la UI
    // El token ya está en cookie HttpOnly — no necesitamos guardarlo aquí
    this.authService.saveUserInfo(name || 'Usuario', email, role, Number(userId));

    // Redirigir según rol
    if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard-user']);
    }
  }
}