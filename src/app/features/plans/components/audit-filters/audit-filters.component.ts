import { Component, EventEmitter, Output } from '@angular/core';
import { AuditFilter } from '../../../../core/core-plans/models/plan.model';

/**
 * Componente reutilizable de filtros para la bitácora de auditoría.
 * Emite los criterios de filtrado al componente padre (HU48).
 * Se puede usar tanto en el detalle de un plan como en la página global de auditoría.
 */
@Component({
  selector: 'app-audit-filters',
  templateUrl: './audit-filters.component.html',
  styleUrl: './audit-filters.component.scss'
})
export class AuditFiltersComponent {

  /** Evento emitido cuando cambian los filtros */
  @Output() filtersChanged = new EventEmitter<AuditFilter>();

  /** Filtro por tipo de acción */
  action: string = '';

  /** Filtro por fecha inicio */
  startDate: string = '';

  /** Filtro por fecha fin */
  endDate: string = '';

  /**
   * Emite los filtros actuales al componente padre.
   */
  applyFilters(): void {
    this.filtersChanged.emit({
      action: this.action,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  /**
   * Limpia todos los filtros y notifica al padre.
   */
  clearFilters(): void {
    this.action = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }
}