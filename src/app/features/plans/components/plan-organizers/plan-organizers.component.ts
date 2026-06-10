import { Component, Input, OnInit } from '@angular/core';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';
import { UserService } from '../../../../core/core-auth/services/user.service';
import { forkJoin } from 'rxjs';

/**
 * Fila de organizador con datos enriquecidos del usuario.
 */
interface OrganizerRow {
  fullName: string;
  email: string;
  startDate: string;
  endDate: string;
  status: string;
}

/**
 * Componente que muestra los organizadores que tienen asignado un plan (RF25.2).
 * Consulta las asignaciones del plan y enriquece cada una con el nombre
 * y correo del organizador desde el auth-service.
 */

@Component({
  selector: 'app-plan-organizers',
  templateUrl: './plan-organizers.component.html',
  styleUrl: './plan-organizers.component.scss'
})
export class PlanOrganizersComponent implements OnInit {

  /** ID del plan a consultar */
  @Input() planId!: number;

  /** Filas de organizadores con datos completos */
  organizers: OrganizerRow[] = [];

  /** Indica si está cargando */
  isLoading = true;

  /** Mensaje de error */
  errorMessage = '';

  constructor(
    private userPlanService: UserPlanService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadOrganizers();
  }

  /**
   * Carga los organizadores del plan y enriquece con datos del usuario.
   */
  loadOrganizers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userPlanService.getOrganizersByPlan(this.planId).subscribe({
      next: (res) => {
        const userPlans = res.data;

        if (userPlans.length === 0) {
          this.organizers = [];
          this.isLoading = false;
          return;
        }

        // Por cada asignación consulta los datos del usuario
        const requests = userPlans.map(up =>
          this.userService.getUserById(up.userId)
        );

        forkJoin(requests).subscribe({
          next: (userResponses) => {
            this.organizers = userPlans.map((up, i) => ({
              fullName: userResponses[i].data.fullName,
              email: userResponses[i].data.email,
              startDate: up.startDate,
              endDate: up.endDate,
              status: up.status
            }));
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = 'No se pudieron cargar los datos de los organizadores.';
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los organizadores.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Formatea una fecha ISO a formato legible.
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'short', day: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Retorna el label legible del estado.
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      expired: 'Vencido',
      cancelled: 'Cancelado'
    };
    return labels[status] ?? status;
  }
}