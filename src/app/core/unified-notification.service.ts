import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProfileService } from './core-auth/services/profile.service';
import { PlanNotificationService } from './core-plans/services/plan-notification.service';
import { NotificationInbox } from './core-auth/models/profile.model';

/**
 * Servicio que unifica las notificaciones de todos los microservicios.
 *
 * <p>Combina las notificaciones del auth-service y del ms-planes en una sola
 * lista ordenada por fecha. Marca el origen de cada una para poder marcarlas
 * como leídas en el microservicio correcto.</p>
 */
@Injectable({
  providedIn: 'root'
})
export class UnifiedNotificationService {

  constructor(
    private profileService: ProfileService,
    private planNotificationService: PlanNotificationService
  ) { }

  /**
   * Obtiene todas las notificaciones de auth y planes juntas, ordenadas por fecha.
   */
  getAllNotifications(): Observable<NotificationInbox[]> {
    return forkJoin({
      auth: this.profileService.getInbox().pipe(
        map(res => res.data.map(n => ({ ...n, source: 'auth' as const }))),
        catchError(() => of([] as NotificationInbox[]))
      ),
      plans: this.planNotificationService.getNotifications().pipe(
        map(res => res.data.map(n => ({ ...n, source: 'plans' as const }))),
        catchError(() => of([] as NotificationInbox[]))
      )
    }).pipe(
      map(({ auth, plans }) => {
        // Junta ambas listas y ordena por fecha descendente
        return [...auth, ...plans].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
    );
  }

  /**
   * Marca una notificación como leída en el microservicio correspondiente.
   * @param notification notificación a marcar
   */
  markAsRead(notification: NotificationInbox): Observable<any> {
    if (notification.source === 'plans') {
      return this.planNotificationService.markAsRead(notification.id);
    }
    return this.profileService.markAsRead(notification.id);
  }
}