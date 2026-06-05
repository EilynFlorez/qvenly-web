import { Component, OnInit } from '@angular/core';
import { PlanFilter, PlanResponse } from '../../../../core/core-plans/models/plan.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { Router } from '@angular/router';

/**
 * Página principal de gestión de planes.
 * Muestra la lista de planes con filtros de búsqueda (HU37, HU38).
 */

@Component({
  selector: 'app-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.scss'
})
export class PlanListComponent implements OnInit {

  /** Mensaje de éxito tras eliminar */
  successMessage = '';

  /** Lista de planes cargados */
  plans: PlanResponse[] = [];

  /** Indica si está cargando */
  isLoading = true;

  /** Mensaje de error */
  errorMessage = '';

  /** Controla si se muestran los filtros */
  showFilters = false;

  /** Plan seleccionado para eliminar */
  planToDelete: PlanResponse | null = null;

  /** Motivo de eliminación */
  deleteReason = '';

  /** Error del motivo de eliminación */
  deleteReasonError = '';

  /** Indica si está eliminando */
  isDeleting = false;

  /** Formulario de filtros */
  filterForm: FormGroup;

  constructor(
    private planService: PlanService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      status: [''],
      minPrice: [''],
      maxPrice: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  /**
   * Carga todos los planes desde el backend.
   */
  loadPlans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.planService.getAllPlans().subscribe({
      next: (res) => {
        this.plans = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los planes.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplica los filtros de búsqueda (HU38).
   */
  applyFilters(): void {
    const filters: PlanFilter = {
      name: this.filterForm.value.name || undefined,
      status: this.filterForm.value.status || undefined,
      minPrice: this.filterForm.value.minPrice || undefined,
      maxPrice: this.filterForm.value.maxPrice || undefined
    };
    this.isLoading = true;
    this.planService.filterPlans(filters).subscribe({
      next: (res) => {
        this.plans = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al filtrar los planes.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Limpia los filtros y recarga todos los planes.
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.loadPlans();
  }

  /**
   * Navega al detalle de un plan.
   */
  viewPlan(id: number): void {
    this.router.navigate(['/plans', id]);
  }

  /**
   * Navega al formulario de edición.
   */
  editPlan(id: number): void {
    this.router.navigate(['/plans/edit', id]);
  }

  /**
   * Abre el modal de confirmación de eliminación.
   */
  openDeleteModal(plan: PlanResponse): void {
    this.planToDelete = plan;
    this.deleteReason = '';
    this.deleteReasonError = '';
  }

  /**
   * Cierra el modal de eliminación.
   */
  closeDeleteModal(): void {
    this.planToDelete = null;
    this.deleteReason = '';
    this.deleteReasonError = '';
  }

  /**
   * Confirma y ejecuta la eliminación lógica del plan (HU41).
   */
  confirmDelete(reason: string): void {
  if (!this.planToDelete) return;

  this.isDeleting = true;
  this.planService.deletePlan(this.planToDelete.idPlan, reason).subscribe({
    next: () => {
      this.isDeleting = false;
      this.closeDeleteModal();
      this.loadPlans();
      this.successMessage = 'El plan fue eliminado exitosamente.';
    },
    error: (err) => {
      this.isDeleting = false;
    }
  });
}

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
