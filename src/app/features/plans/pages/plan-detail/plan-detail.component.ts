import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PlanAuditService } from '../../../../core/core-plans/services/plan-audit.service';
import { PlanResponse, PlanAuditResponse } from '../../../../core/core-plans/models/plan.model';

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

  goBack(): void {
    this.router.navigate(['/plans']);
  }

  editPlan(): void {
    this.router.navigate(['/plans/edit', this.plan?.idPlan]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  }

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
}
