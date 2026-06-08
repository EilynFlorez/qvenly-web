import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshDone$ = new BehaviorSubject<boolean>(false);

  private readonly SKIP_REFRESH_URLS = [
    '/auth/refresh-from-cookie',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/confirm-email',
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authReq = req.clone({ withCredentials: true });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        const shouldSkip = this.SKIP_REFRESH_URLS.some(url => req.url.includes(url));
        if (error.status !== 401 || shouldSkip) {
          return throwError(() => error);
        }

        if (!this.authService.isAuthenticated()) {
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        if (this.isRefreshing) {
          return this.refreshDone$.pipe(
            filter(done => done === true),
            take(1),
            switchMap(() => timer(300)),
            switchMap(() => next.handle(req.clone({ withCredentials: true })))
          );
        }

        return this.doRefresh(req, next);
      })
    );
  }

  /**
   * Ejecuta el refresh del token y reintenta la petición original.
   * Separado en método propio para aislar su catchError del catchError
   * del reintento — evita que un 404 del reintento se confunda con un
   * fallo del refresh.
   */
  private doRefresh(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    this.isRefreshing = true;
    this.refreshDone$.next(false);

    // Paso 1: llamar al endpoint de refresh
    return this.http.post<any>(
      `${environment.apiUrl}/auth/refresh-from-cookie`,
      {},
      { withCredentials: true }
    ).pipe(
      catchError((refreshError) => {
        // El refresh_token expiró — sesión terminada
        this.isRefreshing = false;
        this.refreshDone$.next(false);
        this.authService.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => refreshError);
      }),
      switchMap((response) => {
        // Paso 2: refresh exitoso
        this.isRefreshing = false;

        if (response?.data?.name && response?.data?.role) {
          this.authService.saveUserInfo(
            response.data.name,
            response.data.email,
            response.data.role,
            response.data.userId
          );
        }

        this.refreshDone$.next(true);

        // Paso 3: esperar que el navegador registre las cookies y reintentar
        return timer(300).pipe(
          switchMap(() => next.handle(req.clone({ withCredentials: true })))
          // NO hay catchError aquí — errores del reintento (404, 403, etc.)
          // se propagan normalmente al componente sin tocar la sesión
        );
      })
    );
  }
}