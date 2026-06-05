import { Component, Input } from '@angular/core';
import { PlanResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Componente que muestra la información completa de un plan (HU39).
 * Incluye precio, límites por rol y fechas.
 */
@Component({
  selector: 'app-plan-detail-card',
  templateUrl: './plan-detail-card.component.html',
  styleUrl: './plan-detail-card.component.scss'
})
export class PlanDetailCardComponent {

  /** Plan a mostrar */
  @Input() plan!: PlanResponse;

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
   * Formatea una fecha ISO a formato legible.
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  }
}