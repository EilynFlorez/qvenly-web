import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuditFilter, PlanAuditResponse } from '../../../../core/core-plans/models/plan.model';
import { UserService } from '../../../../core/core-auth/services/user.service';

/**
 * Registro de auditoría enriquecido con los datos del usuario.
 */
interface EnrichedAudit extends PlanAuditResponse {
  userName?: string;
  userEmail?: string;
}

/**
 * Componente reutilizable para mostrar la bitácora de auditoría.
 * Aplica los filtros recibidos del componente audit-filters (HU48)
 * y enriquece cada registro con el nombre y correo del usuario.
 */
@Component({
  selector: 'app-audit-table',
  templateUrl: './audit-table.component.html',
  styleUrl: './audit-table.component.scss'
})
export class AuditTableComponent implements OnChanges {

  /** Todos los registros de auditoría sin filtrar */
  @Input() audits: PlanAuditResponse[] = [];

  /** Indica si está cargando */
  @Input() isLoading: boolean = false;

  /** Mensaje de error */
  @Input() error: string = '';

  /** Registros enriquecidos con datos del usuario */
  enrichedAudits: EnrichedAudit[] = [];

  /** Registros filtrados que se muestran en la tabla */
  filteredAudits: EnrichedAudit[] = [];

  constructor(private userService: UserService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['audits'] && this.audits.length > 0) {
      this.enrichAudits();
    }
  }

  /**
   * Enriquece cada registro de auditoría con el nombre y correo del usuario.
   * Consulta los datos únicos de usuario para evitar llamadas repetidas.
   */
  /**
 * Enriquece cada registro de auditoría con el nombre y correo del usuario,
 * tanto en la columna usuario como en los IDs que aparecen en la descripción.
 */
  enrichAudits(): void {
    // IDs de la columna usuario
    const userColumnIds = this.audits.map(a => a.userId);

    // IDs que aparecen dentro del texto de las descripciones
    const descriptionIds: number[] = [];
    this.audits.forEach(audit => {
      const matches = audit.changeDescription.matchAll(/ID:\s*(\d+)/g);
      for (const match of matches) {
        descriptionIds.push(Number(match[1]));
      }
    });

    // Unifica todos los IDs únicos a consultar
    const uniqueIds = [...new Set([...userColumnIds, ...descriptionIds])];

    // Consulta cada usuario, tolerando errores individuales
    const requests = uniqueIds.map(id =>
      this.userService.getUserById(id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        // Mapa de id → datos del usuario
        const userMap = new Map<number, { name: string; email: string }>();
        responses.forEach((res, i) => {
          if (res && res.data) {
            userMap.set(uniqueIds[i], {
              name: res.data.fullName,
              email: res.data.email
            });
          }
        });

        // Enriquece cada registro
        this.enrichedAudits = this.audits.map(audit => ({
          ...audit,
          userName: userMap.get(audit.userId)?.name,
          userEmail: userMap.get(audit.userId)?.email,
          changeDescription: this.replaceIdsInDescription(audit.changeDescription, userMap)
        }));
        this.filteredAudits = this.enrichedAudits;
      },
      error: () => {
        this.enrichedAudits = this.audits;
        this.filteredAudits = this.audits;
      }
    });
  }

  /**
   * Aplica los filtros recibidos del componente audit-filters.
   * @param filters criterios de filtrado
   */
  onFiltersChanged(filters: AuditFilter): void {
    this.filteredAudits = this.enrichedAudits.filter(audit => {
      const matchAction = !filters.action || audit.action === filters.action;
      const auditDate = new Date(audit.auditDate);
      const matchStart = !filters.startDate ||
        auditDate >= new Date(filters.startDate);
      const matchEnd = !filters.endDate ||
        auditDate <= new Date(filters.endDate + 'T23:59:59');
      return matchAction && matchStart && matchEnd;
    });
  }

  /**
   * Retorna el label legible de una acción de auditoría.
   * @param action tipo de acción
   */
  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      create: 'Creación',
      update: 'Actualización',
      delete: 'Eliminación',
      assign: 'Asignación',
      renew: 'Renovación'
    };
    return labels[action] ?? action;
  }

  /**
   * Retorna la clase CSS del badge según la acción.
   * @param action tipo de acción
   */
  getActionClass(action: string): string {
    const classes: Record<string, string> = {
      create: 'audit-badge--create',
      update: 'audit-badge--update',
      delete: 'audit-badge--delete',
      assign: 'audit-badge--assign',
      renew: 'audit-badge--renew'
    };
    return classes[action] ?? '';
  }

  /**
   * Formatea una fecha ISO a formato legible.
   * @param date fecha en formato ISO
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  }

  /**
 * Reemplaza los patrones "ID: X" en la descripción por el nombre y correo del usuario.
 * Si no se encuentra el usuario, deja el ID original.
 * @param description texto original de la descripción
 * @param userMap mapa de id → datos del usuario
 * @returns descripción con los IDs reemplazados por nombre(correo)
 */
  private replaceIdsInDescription(
    description: string,
    userMap: Map<number, { name: string; email: string }>
  ): string {
    // Busca patrones tipo "ID: 123"
    return description.replace(/ID:\s*(\d+)/g, (match, id) => {
      const user = userMap.get(Number(id));
      return user ? `${user.name} (${user.email})` : match;
    });
  }
}