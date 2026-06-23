import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PaymentService } from '../../../../core/core-payments/services/payment.service';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { PlanResponse, UserPlanResponse } from '../../../../core/core-plans/models/plan.model';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.scss']
})
export class PlanesComponent implements OnInit {

  plans: PlanResponse[] = [];
  activePlan: UserPlanResponse | null = null;
  loading = true;
  error = false;
  processingPayment = false;
  paymentError = '';
  selectedPlanId: number | null = null;
  userId: number | null = null;

  // Para el modal de confirmación de cambio de plan
  showChangeConfirm = false;
  planPendingConfirm: PlanResponse | null = null;

  constructor(
    private planService: PlanService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
    private userPlanService: UserPlanService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadPlans();
    this.loadActivePlan();
  }

  loadPlans(): void {
    this.loading = true;
    this.planService.getAllPlans().subscribe({
      next: (res) => {
        if (res.success) this.plans = res.data.filter(p => p.status === 'active');
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  loadActivePlan(): void {
    if (!this.userId) return;
    this.userPlanService.getActivePlanByUser(this.userId).subscribe({
      next: (response) => {
        if (response.success) this.activePlan = response.data;
      },
      error: () => { /* sin plan activo, lo dejamos en null */ }
    });
  }

  isActivePlan(plan: PlanResponse): boolean {
    return this.activePlan?.plan.idPlan === plan.idPlan;
  }

  onAcquirePlan(plan: PlanResponse): void {
    if (this.isActivePlan(plan)) return; // por seguridad, el botón ya está disabled

    if (this.activePlan) {
      this.planPendingConfirm = plan;
      this.showChangeConfirm = true;
      return;
    }

    this.startPayment(plan);

    if (!this.userId) return;
    this.processingPayment = true;
    this.paymentError = '';
    this.selectedPlanId = plan.idPlan;

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
          this.selectedPlanId = null;
        }
      },
      error: (err) => {
        this.paymentError = err.error?.message || 'Error al procesar el pago.';
        this.processingPayment = false;
        this.selectedPlanId = null;
      }
    });
  }

  confirmChangePlan(): void {
    if (!this.planPendingConfirm) return;
    this.startPayment(this.planPendingConfirm);
    this.showChangeConfirm = false;
    this.planPendingConfirm = null;
  }

  cancelChangePlan(): void {
    this.showChangeConfirm = false;
    this.planPendingConfirm = null;
  }

  private startPayment(plan: PlanResponse): void {
    if (!this.userId) return;
    this.processingPayment = true;
    this.paymentError = '';
    this.selectedPlanId = plan.idPlan;

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
          this.selectedPlanId = null;
        }
      },
      error: (err) => {
        this.paymentError = err.error?.message || 'Error al procesar el pago.';
        this.processingPayment = false;
        this.selectedPlanId = null;
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

  isProcessing(planId: number): boolean {
    return this.processingPayment && this.selectedPlanId === planId;
  }

}