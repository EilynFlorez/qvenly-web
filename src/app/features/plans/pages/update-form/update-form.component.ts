import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PlanRequest, PlanResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Página para editar un plan de servicio existente (HU40).
 */
@Component({
  selector: 'app-update-form',
  templateUrl: './update-form.component.html',
  styleUrl: './update-form.component.scss'
})
export class UpdateFormComponent implements OnInit {

  /** Plan existente cargado desde el backend */
  existingPlan: PlanResponse | null = null;

  /** ID del plan a editar */
  planId!: number;

  /** Indica si está cargando el plan */
  isLoading = true;

  /** Indica si está enviando el formulario */
  isSubmitting = false;

  /** Mensaje de error general */
  errorMessage = '';

  constructor(
    private planService: PlanService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.planId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlan();
  }

  /**
   * Carga los datos del plan desde el backend.
   */
  loadPlan(): void {
    this.isLoading = true;
    this.planService.getPlanById(this.planId).subscribe({
      next: (res) => {
        this.existingPlan = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el plan.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Envía el formulario para actualizar el plan (HU40).
   */
  onSubmit(data: PlanRequest): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.planService.updatePlan(this.planId, data).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/plans']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'No se pudo actualizar el plan.';
      }
    });
  }

  /**
   * Cancela y vuelve a la lista.
   */
  cancel(): void {
    this.router.navigate(['/plans']);
  }
}