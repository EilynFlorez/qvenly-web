import { Component } from '@angular/core';
import { PlanResponse } from '../../../../core/core-plans/models/plan.model';
import { PlanService } from '../../../../core/core-plans/services/plan.service';

/**
 * Componente que muestra la sección de planes de precios en el home.
 * Carga los planes desde el backend y los muestra en cards con paginación
 * de 3 planes por página.
 */

@Component({
  selector: 'app-pricing-section',
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss'
})

export class PricingSectionComponent {
  /** Lista completa de planes cargados desde el backend */
  plans: PlanResponse[] = [];

  /** Planes visibles en la página actual */
  visiblePlans: PlanResponse[] = [];

  /** Índice de la página actual */
  currentPage: number = 0;

  /** Cantidad de planes por página */
  plansPerPage: number = 3;

  /** Indica si está cargando los planes */
  isLoading: boolean = true;

  /** Mensaje de error si falla la carga */
  errorMessage: string = '';

  constructor(private planService: PlanService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  /**
   * Carga todos los planes activos desde el backend.
   */
  loadPlans(): void {
    this.isLoading = true;
    this.planService.getAllPlans().subscribe({
      next: (response) => {
        this.plans = response.data.filter(p => p.status === 'active');
        this.updateVisiblePlans();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los planes. Intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Actualiza los planes visibles según la página actual.
   */
  updateVisiblePlans(): void {
    const start = this.currentPage * this.plansPerPage;
    const end = start + this.plansPerPage;
    this.visiblePlans = this.plans.slice(start, end);
  }

  /**
   * Navega a la página anterior.
   */
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateVisiblePlans();
    }
  }

  /**
   * Navega a la página siguiente.
   */
  nextPage(): void {
    if ((this.currentPage + 1) * this.plansPerPage < this.plans.length) {
      this.currentPage++;
      this.updateVisiblePlans();
    }
  }

  /**
   * Verifica si hay página anterior disponible.
   */
  get hasPrev(): boolean {
    return this.currentPage > 0;
  }

  /**
   * Verifica si hay página siguiente disponible.
   */
  get hasNext(): boolean {
    return (this.currentPage + 1) * this.plansPerPage < this.plans.length;
  }

  /**
   * Calcula el número total de páginas.
   */
  get totalPages(): number {
    return Math.ceil(this.plans.length / this.plansPerPage);
  }

  /**
   * Formatea el precio en pesos colombianos.
   * @param price precio a formatear
   * @returns precio formateado en COP
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }


}
