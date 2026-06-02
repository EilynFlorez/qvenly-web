import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { Router } from '@angular/router';

/**
 * Página para crear un nuevo plan de servicio (HU36).
 * Utiliza ReactiveForm con validaciones.
 */
@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.scss'
})
export class CreateFormComponent implements OnInit {

  /** Formulario reactivo de creación */
  planForm: FormGroup;

  /** Indica si está enviando el formulario */
  isSubmitting = false;

  /** Mensaje de error general */
  errorMessage = '';

  /** Mensaje de éxito */
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router
  ) {
    this.planForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.buildForm();
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
   * Verifica si un campo tiene error y fue tocado.
   * @param field nombre del campo
   */
  hasError(field: string): boolean {
    const control = this.planForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Retorna el mensaje de error de un campo.
   * @param field nombre del campo
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
   * Envía el formulario para crear el plan (HU36).
   */
  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.planService.createPlan(this.planForm.value).subscribe({
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
    this.successMessage = '';
    this.router.navigate(['/plans']);
  }

  /**
   * Cancela y vuelve a la lista.
   */
  cancel(): void {
    this.router.navigate(['/plans']);
  }
}
