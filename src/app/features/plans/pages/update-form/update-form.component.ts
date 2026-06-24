import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PlanRequest, PlanResponse } from '../../../../core/core-plans/models/plan.model';

/**
 * Página para editar un plan de servicio existente (HU40).
 */
@Component({
  selector: 'app-update-form',
  templateUrl: './update-form.component.html',
  styleUrl: './update-form.component.scss'
})
export class UpdateFormComponent implements OnInit {

  /** Plan existente cargado desde el backend */
  existingPlan: PlanResponse | null = null;

  /** Valores originales del plan para detectar cambios */
  originalValues: PlanRequest | null = null;

  /** ID del plan a editar */
  planId!: number;

  /** Indica si está cargando el plan */
  isLoading = true;

  /** Indica si está enviando el formulario */
  isSubmitting = false;

  /** Mensaje de error general */
  errorMessage = '';

  /** Controla el modal de confirmación */
  showConfirmModal = false;

  /** Datos a guardar cuando confirme */
  pendingData: PlanRequest | null = null;

  /** Mensaje del modal de éxito */
  successMessage = '';

  /** Mensaje del modal de sin cambios */
  noChangesMessage = '';

  constructor(
    private planService: PlanService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.planId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlan();
  }

  /**
   * Carga los datos del plan desde el backend.
   */
  loadPlan(): void {
    this.isLoading = true;
    this.planService.getPlanById(this.planId).subscribe({
      next: (res) => {
        this.existingPlan = res.data;
        this.originalValues = {
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          durationDays: res.data.durationDays,
          maxEvents: res.data.maxEvents,
          maxOrganizers: res.data.maxOrganizers,
          maxGuests: res.data.maxGuests,
          maxStaff: res.data.maxStaff,
          status: res.data.status
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el plan.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Verifica si hubo cambios y muestra modal de confirmación (HU40).
   */
  onSubmit(data: PlanRequest): void {
    if (!this.hasChanges(data)) {
      this.noChangesMessage = 'No se realizó ningún cambio.';
      return;
    }
    this.pendingData = data;
    this.showConfirmModal = true;
  }

  /**
   * Compara los datos del formulario con los originales.
   */
  hasChanges(data: PlanRequest): boolean {
    if (!this.originalValues) return true;
    return JSON.stringify(data) !== JSON.stringify(this.originalValues);
  }

  /**
   * Confirma y guarda los cambios.
   */
  confirmSave(): void {
    if (!this.pendingData) return;
    this.isSubmitting = true;
    this.showConfirmModal = false;
    this.errorMessage = '';

    this.planService.updatePlan(this.planId, this.pendingData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Los cambios fueron guardados exitosamente.';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'No se pudo actualizar el plan.';
      }
    });
  }

  /**
   * Cancela la confirmación y vuelve al formulario.
   */
  cancelConfirm(): void {
    this.showConfirmModal = false;
    this.pendingData = null;
  }

  /**
   * Acepta el mensaje de sin cambios y vuelve a la lista.
   */
  acceptNoChanges(): void {
    this.router.navigate(['/plans']);
  }

  /**
   * Acepta el éxito y vuelve a la lista.
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