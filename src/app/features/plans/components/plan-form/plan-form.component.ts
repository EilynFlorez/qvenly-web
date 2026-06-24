import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanRequest, PlanResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Componente de formulario reutilizable para crear y editar planes (HU36, HU40).
 * Recibe opcionalmente un plan existente para modo edición.
 */
@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss'
})
export class PlanFormComponent implements OnInit {

  /** Plan existente para modo edición. Si es null, es modo creación */
  @Input() existingPlan: PlanResponse | null = null;

  /** Texto del botón de envío */
  @Input() submitLabel: string = 'Guardar';

  /** Indica si está procesando el envío */
  @Input() isSubmitting: boolean = false;

  /** Mensaje de error general */
  @Input() errorMessage: string = '';

  /** Evento emitido al enviar el formulario con los datos */
  @Output() formSubmit = new EventEmitter<PlanRequest>();

  /** Evento emitido al cancelar */
  @Output() formCancel = new EventEmitter<void>();

  /** Formulario reactivo */
  planForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.planForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.existingPlan) {
      this.planForm.patchValue(this.existingPlan);
    }
  }

  /**
   * Construye el formulario con sus validaciones.
   */
  buildForm(): void {
  this.planForm = this.fb.group({
    name:           ['', [Validators.required, Validators.maxLength(100)]],
    description:    ['', [Validators.required]],
    price:          [null, [Validators.required, Validators.min(0.01)]],
    durationDays:   [null, [Validators.required, Validators.min(1)]],
    maxEvents: [0, [Validators.required, Validators.min(0)]],
    maxOrganizers:  [0, [Validators.required, Validators.min(0)]],
    maxGuests:      [0, [Validators.required, Validators.min(0)]],
    maxStaff:       [0, [Validators.required, Validators.min(0)]],
    status:         ['active', [Validators.required]]
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
   * Valida y emite el formulario.
   */
  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.planForm.value);
  }

  /**
   * Emite el evento de cancelación.
   */
  onCancel(): void {
    this.formCancel.emit();
  }
}