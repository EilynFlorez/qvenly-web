import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';
import { PlanHistoryResponse, UserPlanResponse } from '../../../../core/core-plans/models/plan.model';
import { PlanHistoryService } from '../../../../core/core-plans/services/plan-history.service';
import { PaymentService } from '../../../../core/core-payments/services/payment.service';

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
  planHistory: PlanHistoryResponse[] = [];
  loadingHistory = true;
  errorHistory = false;

  /** Indica si la renovación está en proceso */
  renewing = false;

  /** Mensaje de éxito tras renovar */
  successMessage = '';
  renewError = '';



  constructor(
    private authService: AuthService,
    private userPlanService: UserPlanService,
    private planHistoryService: PlanHistoryService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.loadActivePlan();
    this.loadPlanHistory();

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
 * Carga el historial de planes del organizador (HU46).
 */
  loadPlanHistory(): void {
    const userId = this.authService.getUserId();
    if (!userId) { this.loadingHistory = false; return; }

    this.loadingHistory = true;
    this.planHistoryService.getHistoryByUser(userId).subscribe({
      next: (response) => {
        if (response.success) this.planHistory = response.data;
        this.loadingHistory = false;
      },
      error: (err) => {
        // 404 significa que el usuario aún no tiene historial; no es un error real
        if (err?.status !== 404) this.errorHistory = true;
        this.loadingHistory = false;
      }
    });
  }

  /**
   * Renueva el plan activo del organizador.
   * Envía el correo y nombre del usuario para la notificación.
   */
  /**
 * Renueva el plan activo del organizador.
 */

  get canRenew(): boolean {
    return this.getDaysRemaining() <= 2;
  }

  renewPlan(): void {
    if (!this.activePlan) return;

    if (!this.canRenew) {
      this.renewError = `Aún no puedes renovar tu plan. Te quedan ${this.getDaysRemaining()} días disponibles. ` +
        `Podrás renovar cuando falten 2 días o menos para el vencimiento.`;
      return;
    }

    this.renewError = '';
    this.renewing = true;

    this.paymentService.createPayment({
      userId: this.authService.getUserId()!,
      planId: this.activePlan.plan.idPlan,
      planName: this.activePlan.plan.name,
      price: this.activePlan.plan.price
    }).subscribe({
      next: (response) => {
        if (response.success) {
          window.location.href = response.data.checkoutUrl;
        } else {
          this.renewError = response.message;
          this.renewing = false;
        }
      },
      error: (err) => {
        this.renewError = err.error?.message || 'Error al procesar el pago de renovación.';
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