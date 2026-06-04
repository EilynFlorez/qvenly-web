import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AuditFilter, PlanAuditResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Componente reutilizable para mostrar la bitácora de auditoría.
 * Aplica los filtros recibidos del componente audit-filters (HU48).
 * Se puede usar en el detalle de un plan y en la página global de auditoría.
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

  /** Registros filtrados que se muestran en la tabla */
  filteredAudits: PlanAuditResponse[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['audits']) {
      this.filteredAudits = this.audits;
    }
  }

  /**
   * Aplica los filtros recibidos del componente audit-filters.
   * @param filters criterios de filtrado
   */
  onFiltersChanged(filters: AuditFilter): void {
    this.filteredAudits = this.audits.filter(audit => {
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
      renew:  'Renovación'
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
      renew:  'audit-badge--renew'
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
}