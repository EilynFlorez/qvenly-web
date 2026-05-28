import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

/**
 * Interceptor HTTP que gestiona automáticamente la renovación del token JWT.
 *
 * Flujo:
 * 1. Agrega withCredentials a todas las peticiones para enviar cookies HttpOnly.
 * 2. Si recibe un 401, llama a /auth/refresh-from-cookie para renovar el token.
 * 3. Si el refresh es exitoso, reintenta la petición original automáticamente.
 * 4. Si el refresh falla, redirige al login.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router, private http: HttpClient) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authReq = req.clone({ withCredentials: true });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // Si no es 401, o es el mismo refresh/login, propagar el error sin reintentar
        if (
          error.status !== 401 ||
          req.url.includes('/auth/refresh-from-cookie') ||
          req.url.includes('/auth/login')
        ) {
          return throwError(() => error);
        }

        // Intentar renovar el token desde la cookie
        return this.http.post<any>(
          `${environment.apiUrl}/auth/refresh-from-cookie`,
          {},
          { withCredentials: true }
        ).pipe(
          switchMap(() => {
            // Token renovado exitosamente, reintentar la petición original
            return next.handle(authReq);
          }),
          catchError(() => {
            // El refresh falló, sesión expirada → redirigir al login
            this.router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      })
    );
  }
}
