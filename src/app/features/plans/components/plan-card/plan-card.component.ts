import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Componente card reutilizable para mostrar la información
 * resumida de un plan de servicio (HU37).
 */
@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.component.html',
  styleUrl: './plan-card.component.scss'
})
export class PlanCardComponent {

  /** Plan a mostrar */
  @Input() plan!: PlanResponse;

  /** Evento emitido al hacer clic en Ver */
  @Output() view = new EventEmitter<number>();

  /** Evento emitido al hacer clic en Editar */
  @Output() edit = new EventEmitter<number>();

  /** Evento emitido al hacer clic en Eliminar */
  @Output() delete = new EventEmitter<PlanResponse>();

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
}