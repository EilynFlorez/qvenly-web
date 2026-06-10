import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PaymentService } from '../../../../core/core-payments/services/payment.service';
import { UserPlanResponse, PlanResponse } from '../../../../core/core-plans/models/plan.model';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  styleUrls: ['./dashboard-user.component.scss']
})
export class DashboardUserComponent implements OnInit {

  Math = Math;

  // ─── Info del usuario ─────────────────────────────────────────────────
  userName = '';
  userId: number | null = null;

  // ─── Plan activo ──────────────────────────────────────────────────────
  activePlan: UserPlanResponse | null = null;
  loadingActivePlan = true;

  // ─── Planes disponibles ───────────────────────────────────────────────
  availablePlans: PlanResponse[] = [];
  loadingPlans = true;
  plansError = false;

  // ─── Estado del pago ──────────────────────────────────────────────────
  processingPayment = false;
  paymentError = '';

  constructor(
    private authService: AuthService,
    private userPlanService: UserPlanService,
    private planService: PlanService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || '';
    this.userId   = this.authService.getUserId();

    this.loadActivePlan();
    this.loadAvailablePlans();
  }

  // ─── Plan ─────────────────────────────────────────────────────────────
  loadActivePlan(): void {
    if (!this.userId) { this.loadingActivePlan = false; return; }
    this.userPlanService.getActivePlanByUser(this.userId).subscribe({
      next: (response) => {
        if (response.success) this.activePlan = response.data;
        this.loadingActivePlan = false;
      },
      error: () => { this.loadingActivePlan = false; }
    });
  }

  loadAvailablePlans(): void {
    this.planService.getAllPlans().subscribe({
      next: (response) => {
        if (response.success) this.availablePlans = response.data;
        this.loadingPlans = false;
      },
      error: () => { this.plansError = true; this.loadingPlans = false; }
    });
  }

  // ─── Pago ─────────────────────────────────────────────────────────────
  onAcquirePlan(plan: PlanResponse): void {
    if (!this.userId) return;
    this.processingPayment = true;
    this.paymentError = '';

    this.paymentService.createPayment({
      userId: this.userId,
      planId: plan.idPlan,
      planName: plan.name,
      price: plan.price
    }).subscribe({
      next: (response) => {
        if (response.success) {
          window.location.href = response.data.checkoutUrl;
        } else {
          this.paymentError = response.message;
          this.processingPayment = false;
        }
      },
      error: (err) => {
        this.paymentError = err.error?.message || 'Error al procesar el pago.';
        this.processingPayment = false;
      }
    });
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP', 
      minimumFractionDigits: 0
    }).format(price);
  }

  getDaysRemaining(): number {
    if (!this.activePlan?.endDate) return 0;
    const diff = Math.ceil(
      (new Date(this.activePlan.endDate).getTime() - new Date().getTime())
      / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }
}
