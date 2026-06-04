import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PlanAuditService } from '../../../../core/core-plans/services/plan-audit.service';
import { PlanResponse, PlanAuditResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Página de detalle de un plan de servicio (HU39).
 * Delega la visualización del plan y la auditoría a componentes hijos.
 */
@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.scss'
})
export class PlanDetailComponent implements OnInit {

  /** Datos del plan */
  plan: PlanResponse | null = null;

  /** Registros de auditoría */
  audits: PlanAuditResponse[] = [];

  /** Estados de carga */
  isLoadingPlan = true;
  isLoadingAudit = true;

  /** Mensajes de error */
  errorPlan = '';
  errorAudit = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private planAuditService: PlanAuditService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlan(id);
    this.loadAudit(id);
  }

  /**
   * Carga los datos del plan desde el backend.
   */
  loadPlan(id: number): void {
    this.isLoadingPlan = true;
    this.planService.getPlanById(id).subscribe({
      next: (res) => {
        this.plan = res.data;
        this.isLoadingPlan = false;
      },
      error: () => {
        this.errorPlan = 'No se pudo cargar el plan.';
        this.isLoadingPlan = false;
      }
    });
  }

  /**
   * Carga los registros de auditoría del plan.
   */
  loadAudit(id: number): void {
    this.isLoadingAudit = true;
    this.planAuditService.getAuditByPlan(id).subscribe({
      next: (res) => {
        this.audits = res.data;
        this.isLoadingAudit = false;
      },
      error: () => {
        this.errorAudit = 'No se pudo cargar la auditoría.';
        this.isLoadingAudit = false;
      }
    });
  }

  /**
   * Vuelve a la lista de planes.
   */
  goBack(): void {
    this.router.navigate(['/plans']);
  }

  /**
   * Navega al formulario de edición.
   */
  editPlan(): void {
    this.router.navigate(['/plans/edit', this.plan?.idPlan]);
  }
}