import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Componente modal de confirmación de eliminación de un plan.
 * Solicita un motivo obligatorio antes de confirmar (HU41).
 */
@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss'
})
export class DeleteModalComponent {

  /** Plan que se va a eliminar */
  @Input() plan!: PlanResponse;

  /** Indica si está procesando la eliminación */
  @Input() isDeleting: boolean = false;

  /** Evento emitido al cancelar */
  @Output() cancelled = new EventEmitter<void>();

  /** Evento emitido al confirmar con el motivo */
  @Output() confirmed = new EventEmitter<string>();

  /** Motivo de eliminación */
  reason: string = '';

  /** Error del motivo */
  reasonError: string = '';

  /**
   * Formatea el precio en pesos colombianos.
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Cancela la eliminación.
   */
  cancel(): void {
    this.reason = '';
    this.reasonError = '';
    this.cancelled.emit();
  }

  /**
   * Valida y confirma la eliminación.
   */
  confirm(): void {
    if (!this.reason.trim()) {
      this.reasonError = 'El motivo de eliminación es obligatorio.';
      return;
    }
    this.reasonError = '';
    this.confirmed.emit(this.reason);
  }
}