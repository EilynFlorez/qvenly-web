import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PaymentService } from '../../../../core/core-payments/services/payment.service';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { PlanResponse } from '../../../../core/core-plans/models/plan.model';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.scss']
})
export class PlanesComponent implements OnInit {

  plans: PlanResponse[] = [];
  loading = true;
  error = false;
  processingPayment = false;
  paymentError = '';
  selectedPlanId: number | null = null;
  userId: number | null = null;

  constructor(
    private planService: PlanService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadPlans();
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

  onAcquirePlan(plan: PlanResponse): void {
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

  getMaxPrice(): number {
    return Math.max(...this.plans.map(p => p.price));
  }
}