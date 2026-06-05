import { Component, OnInit } from '@angular/core';
import { PlanAuditResponse } from '../../../../core/core-plans/models/plan.model';
import { PlanAuditService } from '../../../../core/core-plans/services/plan-audit.service';

/**
 * Página global de auditoría de planes (HU48).
 * Muestra todos los registros de auditoría del sistema con filtros.
 */

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrl: './audit-list.component.scss'
})
export class AuditListComponent implements OnInit {

  /** Todos los registros de auditoría */
  audits: PlanAuditResponse[] = [];

  /** Indica si está cargando */
  isLoading = true;

  /** Mensaje de error */
  errorMessage = '';

  constructor(private planAuditService: PlanAuditService) {}

  ngOnInit(): void {
      this.loadAudits();
  }

  /**
   * Carga todos los registros de auditoría del sistema.
   */
  loadAudits(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.planAuditService.getAllAudits().subscribe({
      next: (res) => {
        this.audits = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los regsitros de auditoría.';
        this.isLoading = false;
      }
    })
  }

}
