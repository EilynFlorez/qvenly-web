import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';
import { UserPlanResponse } from '../../../../core/core-plans/models/plan.model';

@Component({
  selector: 'app-mi-plan',
  templateUrl: './mi-plan.component.html',
  styleUrls: ['./mi-plan.component.scss']
})
export class MiPlanComponent implements OnInit {

  Math = Math;

  activePlan: UserPlanResponse | null = null;
  loading = true;
  error = false;

  /** Indica si la renovación está en proceso */
  renewing = false;

  /** Mensaje de éxito tras renovar */
  successMessage = '';

  constructor(
    private authService: AuthService,
    private userPlanService: UserPlanService
  ) {}

  ngOnInit(): void {
    this.loadActivePlan();
  }

  /**
   * Carga el plan activo del organizador.
   */
  loadActivePlan(): void {
    const userId = this.authService.getUserId();
    if (!userId) { this.loading = false; return; }

    this.loading = true;
    this.userPlanService.getActivePlanByUser(userId).subscribe({
      next: (response) => {
        if (response.success) this.activePlan = response.data;
        this.loading = false;
      },
      error: (err) => { if (err?.status !== 404) this.error = true; this.loading = false; }
    });
  }

  /**
   * Renueva el plan activo del organizador.
   * Envía el correo y nombre del usuario para la notificación.
   */
  renewPlan(): void {
    if (!this.activePlan) return;

    const email = this.authService.getUserEmail() ?? '';
    const name = this.authService.getUserName() ?? '';

    this.renewing = true;
    this.successMessage = '';

    this.userPlanService.renewPlan(this.activePlan.idUserPlan, email, name).subscribe({
      next: (response) => {
        if (response.success) {
          this.activePlan = response.data;
          this.successMessage = 'Tu plan fue renovado exitosamente. Revisa tu correo.';
        }
        this.renewing = false;
      },
      error: () => {
        this.error = true;
        this.renewing = false;
      }
    });
  }

  getDaysRemaining(): number {
    if (!this.activePlan?.endDate) return 0;
    const diff = Math.ceil(
      (new Date(this.activePlan.endDate).getTime() - new Date().getTime())
      / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }

  getProgressPercent(): number {
    if (!this.activePlan) return 0;
    const total = this.activePlan.plan.durationDays || 30;
    return Math.min((this.getDaysRemaining() / total) * 100, 100);
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}