import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PaymentService } from '../../../../core/core-payments/services/payment.service';
import { UserPlanResponse, PlanResponse } from '../../../../core/core-plans/models/plan.model';
import { ActivityService } from '../../../../core/core-activities/services/activity.service';
import { AgendaItem, ActivityMemberRole, ActivityStatus } from '../../../../core/core-activities/models/activity.model';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isSameMonth } from 'date-fns';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  styleUrls: ['./dashboard-user.component.scss']
})
export class DashboardUserComponent implements OnInit {

  Math = Math;

  // ─── Info del usuario ─────────────────────────────────────────────────
  userName = '';
  userId: number | null = null;

  // ─── Plan activo ──────────────────────────────────────────────────────
  activePlan: UserPlanResponse | null = null;
  loadingActivePlan = true;

  // ─── Planes disponibles ───────────────────────────────────────────────
  availablePlans: PlanResponse[] = [];
  loadingPlans = false;
  plansError = false;

  // ─── Agenda ───────────────────────────────────────────────────────────
  agenda: AgendaItem[] = [];
  agendaAll: AgendaItem[] = []; // copia completa sin filtros, para estadísticas y opciones de evento
  loadingAgenda = true;
  agendaError = false;
  processingAgendaAction = false;
  agendaActionError = '';

  showCancelAgendaModal = false;
  cancelAgendaActivityId: number | null = null;
  cancelAgendaReason = '';

  // ─── Filtros de Agenda ────────────────────────────────────────────────
  filterName = '';
  filterEventId: number | null = null;
  filterDate = '';
  filterStatus: ActivityStatus | '' = '';

  // ─── Vista de Agenda (lista / calendario) ──────────────────────────────
  agendaViewMode: 'list' | 'calendar' = 'list';
  CalendarView = CalendarView;
  calendarViewType: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  selectedDayItems: AgendaItem[] = [];

  // ─── Estado del pago ──────────────────────────────────────────────────
  processingPayment = false;
  paymentError = '';

  constructor(
    private authService: AuthService,
    private userPlanService: UserPlanService,
    private planService: PlanService,
    private paymentService: PaymentService,
    private activityService: ActivityService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || '';
    this.userId = this.authService.getUserId();

    this.loadActivePlan();
    this.loadAgenda();
  }

  get hasActivities(): boolean {
    return this.agendaAll.length > 0;
  }

  get sortedAgenda(): AgendaItem[] {
    return [...this.agenda]
      .filter(a => a.activityStatus !== 'FINISHED')
      .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime());
  }

  get calendarEvents(): CalendarEvent[] {
    return this.agenda
      .filter(item => item.confirmationStatus !== 'CANCELLED' && item.activityStatus !== 'FINISHED')
      .map(item => ({
        start: new Date(item.startDatetime),
        end: new Date(item.endDatetime),
        title: item.activityTitle,
        color: this.getCalendarEventColor(item.confirmationStatus),
        meta: item
      }));
  }

  // ─── Estadísticas de Agenda ───────────────────────────────────────────
  get totalActivitiesCount(): number {
    return this.agendaAll.length;
  }

  get confirmedCount(): number {
    return this.agendaAll.filter(a => a.confirmationStatus === 'CONFIRMED' && a.activityStatus !== 'FINISHED').length;
  }

  get pendingCount(): number {
    return this.agendaAll.filter(a => a.confirmationStatus === 'PENDING' && a.activityStatus !== 'FINISHED').length;
  }

  get cancelledCount(): number {
    return this.agendaAll.filter(a => a.confirmationStatus === 'CANCELLED' && a.activityStatus !== 'FINISHED').length;
  }

  get uniqueEventsForFilter(): { eventId: number; eventTitle: string }[] {
    const map = new Map<number, string>();
    this.agendaAll.forEach(a => map.set(a.eventId, a.eventTitle));
    return Array.from(map, ([eventId, eventTitle]) => ({ eventId, eventTitle }));
  }

  get finishedCount(): number {
    return this.agendaAll.filter(a => a.activityStatus === 'FINISHED').length;
  }

  get finishedActivities(): AgendaItem[] {
    return this.agendaAll
      .filter(a => a.activityStatus === 'FINISHED')
      .sort((a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime());
  }

  // ─── Plan ─────────────────────────────────────────────────────────────
  loadActivePlan(): void {
    if (!this.userId) { this.loadingActivePlan = false; this.loadAvailablePlans(); return; }
    this.userPlanService.getActivePlanByUser(this.userId).subscribe({
      next: (response) => {
        if (response.success) this.activePlan = response.data;
        this.loadingActivePlan = false;
        if (!this.activePlan) this.loadAvailablePlans();
      },
      error: () => {
        this.loadingActivePlan = false;
        this.loadAvailablePlans();
      }
    });
  }

  loadAvailablePlans(): void {
    this.loadingPlans = true;
    this.planService.getAllPlans().subscribe({
      next: (response) => {
        if (response.success) this.availablePlans = response.data;
        this.loadingPlans = false;
      },
      error: () => { this.plansError = true; this.loadingPlans = false; }
    });
  }

  // ─── Agenda ───────────────────────────────────────────────────────────
  loadAgenda(): void {
    this.loadingAgenda = true;
    this.agendaError = false;
    this.activityService.getMyAgenda().subscribe({
      next: (res) => {
        if (res.success) {
          this.agenda = res.data;
          this.agendaAll = res.data;
        }
        this.loadingAgenda = false;
      },
      error: () => {
        this.agendaError = true;
        this.loadingAgenda = false;
      }
    });
  }

  applyAgendaFilters(): void {
    this.loadingAgenda = true;
    this.activityService.getMyAgenda({
      name: this.filterName || undefined,
      eventId: this.filterEventId || undefined,
      date: this.filterDate || undefined,
      status: this.filterStatus || undefined
    }).subscribe({
      next: (res) => {
        if (res.success) this.agenda = res.data;
        this.loadingAgenda = false;
      },
      error: () => {
        this.agendaError = true;
        this.loadingAgenda = false;
      }
    });
  }

  clearAgendaFilters(): void {
    this.filterName = '';
    this.filterEventId = null;
    this.filterDate = '';
    this.filterStatus = '';
    this.agenda = this.agendaAll;
  }

  confirmAgendaItem(item: AgendaItem): void {
    this.processingAgendaAction = true;
    this.agendaActionError = '';
    this.activityService.confirmParticipation(item.activityId).subscribe({
      next: (res) => {
        if (res.success) item.confirmationStatus = 'CONFIRMED';
        this.processingAgendaAction = false;
      },
      error: (err) => {
        this.agendaActionError = err.error?.message || 'Error al confirmar.';
        this.processingAgendaAction = false;
      }
    });
  }

  openCancelAgenda(item: AgendaItem): void {
    this.cancelAgendaActivityId = item.activityId;
    this.cancelAgendaReason = '';
    this.agendaActionError = '';
    this.showCancelAgendaModal = true;
  }

  submitCancelAgenda(): void {
    if (!this.cancelAgendaActivityId || !this.cancelAgendaReason.trim()) return;
    this.processingAgendaAction = true;
    this.activityService.cancelParticipation(this.cancelAgendaActivityId, this.cancelAgendaReason).subscribe({
      next: () => {
        this.agenda = this.agenda.filter(a => a.activityId !== this.cancelAgendaActivityId);
        this.agendaAll = this.agendaAll.filter(a => a.activityId !== this.cancelAgendaActivityId);
        this.showCancelAgendaModal = false;
        this.processingAgendaAction = false;
      },
      error: (err) => {
        this.agendaActionError = err.error?.message || 'Error al cancelar.';
        this.processingAgendaAction = false;
      }
    });
  }

  getAgendaRoleLabel(role: ActivityMemberRole): string {
    const labels: Record<ActivityMemberRole, string> = {
      STAFF: 'Personal de apoyo', PARTICIPANT: 'Participante', ATTENDEE: 'Asistente'
    };
    return labels[role] || role;
  }

  getCalendarEventColor(status: string): { primary: string; secondary: string } {
    const colors: Record<string, { primary: string; secondary: string }> = {
      CONFIRMED: { primary: '#00b8a9', secondary: '#e6f8f6' },
      PENDING: { primary: '#f59e0b', secondary: '#fef3e2' },
      CANCELLED: { primary: '#ef4444', secondary: '#fee2e2' }
    };
    return colors[status] || colors['PENDING'];
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (!isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
    }
    this.selectedDate = date;
    this.selectedDayItems = events.map(e => e.meta as AgendaItem);
  }

  closeDayDetail(): void {
    this.selectedDate = null;
    this.selectedDayItems = [];
  }


  // ─── Pago ─────────────────────────────────────────────────────────────
  onAcquirePlan(plan: PlanResponse): void {
    if (!this.userId) return;
    this.processingPayment = true;
    this.paymentError = '';

    this.paymentService.createPayment({
      userId: this.userId,
      planId: plan.idPlan,
      planName: plan.name,
      price: plan.price
    }).subscribe({
      next: (response) => {
        if (response.success) {
          window.location.href = response.data.checkoutUrl;
        } else {
          this.paymentError = response.message;
          this.processingPayment = false;
        }
      },
      error: (err) => {
        this.paymentError = err.error?.message || 'Error al procesar el pago.';
        this.processingPayment = false;
      }
    });
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getDaysRemaining(): number {
    if (!this.activePlan?.endDate) return 0;
    const diff = Math.ceil(
      (new Date(this.activePlan.endDate).getTime() - new Date().getTime())
      / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }
}