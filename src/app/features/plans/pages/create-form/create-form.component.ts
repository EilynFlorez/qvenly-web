import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PlanRequest } from '../../../../core/core-plans/models/plan.model';

/**
 * Página para crear un nuevo plan de servicio (HU36).
 */
@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.scss'
})
export class CreateFormComponent {

  /** Indica si está enviando el formulario */
  isSubmitting = false;

  /** Mensaje de error general */
  errorMessage = '';

  /** Mensaje de éxito */
  successMessage = '';

  constructor(
    private planService: PlanService,
    private router: Router
  ) {}

  /**
   * Envía el formulario para crear el plan (HU36).
   */
  onSubmit(data: PlanRequest): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.planService.createPlan(data).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'El plan fue creado exitosamente.';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'No se pudo crear el plan.';
      }
    });
  }

  /**
   * Acepta el modal de éxito y navega a la lista.
   */
  acceptSuccess(): void {
    this.router.navigate(['/plans']);
  }

  /**
   * Cancela y vuelve a la lista.
   */
  cancel(): void {
    this.router.navigate(['/plans']);
  }
}