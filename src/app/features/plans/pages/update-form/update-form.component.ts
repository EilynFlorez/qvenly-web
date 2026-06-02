import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';

/**
 * Página para editar un plan de servicio existente (HU40).
 * Carga los datos del plan y permite modificarlos con ReactiveForm.
 */
@Component({
  selector: 'app-update-form',
  templateUrl: './update-form.component.html',
  styleUrl: './update-form.component.scss'
})
export class UpdateFormComponent implements OnInit {

  /** Formulario reactivo de edición */
  planForm: FormGroup;

  /** ID del plan a editar */
  planId!: number;

  /** Indica si está cargando el plan */
  isLoading = true;

  /** Indica si está enviando el formulario */
  isSubmitting = false;

  /** Mensaje de error general */
  errorMessage = '';

  /** Mensaje de éxito */
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.planForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.buildForm();
    this.planId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlan();
  }

  /**
   * Construye el formulario con sus validaciones.
   */
  buildForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      durationDays: [null, [Validators.required, Validators.min(1)]],
      maxOrganizers: [0, [Validators.required, Validators.min(0)]],
      maxParticipants: [0, [Validators.required, Validators.min(0)]],
      maxJudges: [0, [Validators.required, Validators.min(0)]],
      maxAttendees: [0, [Validators.required, Validators.min(0)]],
      maxStaff: [0, [Validators.required, Validators.min(0)]],
      status: ['active', [Validators.required]]
    });
  }

  /**
   * Carga los datos del plan desde el backend.
   */
  loadPlan(): void {
    this.isLoading = true;
    this.planService.getPlanById(this.planId).subscribe({
      next: (res) => {
        const plan = res.data;
        this.planForm.patchValue({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          durationDays: plan.durationDays,
          maxOrganizers: plan.maxOrganizers,
          maxParticipants: plan.maxParticipants,
          maxJudges: plan.maxJudges,
          maxAttendees: plan.maxAttendees,
          maxStaff: plan.maxStaff,
          status: plan.status
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el plan.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Verifica si un campo tiene error y fue tocado.
   */
  hasError(field: string): boolean {
    const control = this.planForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Retorna el mensaje de error de un campo.
   */
  getError(field: string): string {
    const control = this.planForm.get(field);
    if (!control) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) return 'Máximo 100 caracteres.';
    if (control.hasError('min')) return 'El valor debe ser mayor a 0.';
    return '';
  }

  /**
   * Envía el formulario para actualizar el plan (HU40).
   */
  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.planService.updatePlan(this.planId, this.planForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message;
        setTimeout(() => this.router.navigate(['/plans']), 1500);
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
