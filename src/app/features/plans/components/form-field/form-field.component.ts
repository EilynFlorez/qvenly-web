import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Componente atómico reutilizable para campos de formulario.
 * Muestra el label, el input y el mensaje de error de forma consistente.
 */
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss'
})
export class FormFieldComponent {

  /** Texto del label */
  @Input() label: string = '';

  /** Icono del label (clase de Tabler Icons) */
  @Input() icon: string = '';

  /** Tipo del input: text, number, select, textarea */
  @Input() type: string = 'text';

  /** Placeholder del input */
  @Input() placeholder: string = '';

  /** Control del formulario reactivo */
  @Input() control!: AbstractControl | null;

  /** Indica si el campo es obligatorio */
  @Input() required: boolean = false;

  /** Opciones para el select */
  @Input() options: { value: string; label: string }[] = [];

  /** Número de filas para textarea */
  @Input() rows: number = 3;

  /**
   * Verifica si el campo tiene error y fue tocado.
   */
  get hasError(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  /**
   * Retorna el mensaje de error del campo.
   */
  get errorMessage(): string {
    if (!this.control) return '';
    if (this.control.hasError('required')) return 'Este campo es obligatorio.';
    if (this.control.hasError('maxlength')) return 'Máximo 100 caracteres.';
    if (this.control.hasError('min')) return 'El valor debe ser mayor a 0.';
    return '';
  }
}