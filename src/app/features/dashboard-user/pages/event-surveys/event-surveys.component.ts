import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-event-surveys',
  templateUrl: './event-surveys.component.html',
  styleUrls: ['./event-surveys.component.scss']
})
export class EventSurveysComponent implements OnInit {

  @Input() eventId!: number;
  @Input() eventStatus!: string;
  @Input() isOrganizer = false;
  @Input() userRole = '';

  // ── Vista actual ──────────────────────────────────────────────────────────
  currentView: 'list' | 'preview' | 'results' = 'list';
  selectedSurvey: any = null;

  // ── Lista ─────────────────────────────────────────────────────────────────
  surveys: any[] = [];
  loading = false;
  error = false;

  // ── Modales simples ───────────────────────────────────────────────────────
  showCreateModal = false;
  showPublishConfirmModal = false;
  showCancelModal = false;

  // ── Estado ────────────────────────────────────────────────────────────────
  processing = false;
  formError = '';
  cancelError = '';

  publishSurveyId: number | null = null;
  cancelSurveyId: number | null = null;
  selectedSurveyId: number | null = null;
  cancelReason = '';

  // ── Preview ───────────────────────────────────────────────────────────────
  previewLoading = false;

  // ── Formulario crear ──────────────────────────────────────────────────────
  surveyForm = {
    title: '',
    description: '',
    deadline: '',
    anonymous: false,
    targetRoles: [] as string[],
    questions: [] as any[]
  };

  availableRoles = [
    { value: 'PARTICIPANT', label: 'Participantes' },
    { value: 'ATTENDEE',    label: 'Asistentes' },
    { value: 'JUDGE',       label: 'Jurados' },
    { value: 'STAFF',       label: 'Personal de apoyo' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  // ── Navegación interna ────────────────────────────────────────────────────
  goToList(): void {
    this.currentView = 'list';
    this.selectedSurvey = null;
    this.selectedSurveyId = null;
  }

  goToPreview(surveyId: number): void {
    this.previewLoading = true;
    this.currentView = 'preview';
    this.http.get<any>(
      `${environment.apiUrl}/api/events/${this.eventId}/surveys/${surveyId}`,
      { withCredentials: true }
    ).subscribe({
      next: res => { this.selectedSurvey = res.data; this.previewLoading = false; },
      error: () => { this.previewLoading = false; this.goToList(); }
    });
  }

  goToResults(surveyId: number): void {
    this.selectedSurveyId = surveyId;
    this.currentView = 'results';
  }

  // ── Carga ─────────────────────────────────────────────────────────────────
  loadSurveys(): void {
    this.loading = true;
    this.error = false;
    this.http.get<any>(
      `${environment.apiUrl}/api/events/${this.eventId}/surveys`,
      { withCredentials: true }
    ).subscribe({
      next: res => { this.surveys = res.data || []; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  // ── Crear (RF130) ─────────────────────────────────────────────────────────
  openCreateModal(): void {
    this.surveyForm = {
      title: '', description: '', deadline: '',
      anonymous: false, targetRoles: [], questions: []
    };
    this.formError = '';
    this.showCreateModal = true;
  }

  toggleRole(role: string): void {
    const idx = this.surveyForm.targetRoles.indexOf(role);
    if (idx >= 0) this.surveyForm.targetRoles.splice(idx, 1);
    else this.surveyForm.targetRoles.push(role);
  }

  addQuestion(): void {
    this.surveyForm.questions.push({
      questionText: '', questionType: 'SINGLE_CHOICE', required: true,
      displayOrder: this.surveyForm.questions.length,
      options: [{ optionText: '', displayOrder: 0 }, { optionText: '', displayOrder: 1 }]
    });
  }

  removeQuestion(i: number): void { this.surveyForm.questions.splice(i, 1); }

  onTypeChange(q: any): void {
    if (q.questionType === 'OPEN_TEXT' || q.questionType === 'RATING') q.options = [];
    else if (!q.options.length)
      q.options = [{ optionText: '', displayOrder: 0 }, { optionText: '', displayOrder: 1 }];
  }

  addOption(q: any): void { q.options.push({ optionText: '', displayOrder: q.options.length }); }
  removeOption(q: any, j: number): void { q.options.splice(j, 1); }

  validateForm(): string {
    if (!this.surveyForm.title.trim()) return 'El título es obligatorio.';
    if (!this.surveyForm.targetRoles.length) return 'Selecciona al menos un grupo de destinatarios.';
    if (!this.surveyForm.questions.length) return 'Agrega al menos una pregunta.';
    for (let i = 0; i < this.surveyForm.questions.length; i++) {
      const q = this.surveyForm.questions[i];
      if (!q.questionText.trim()) return `La pregunta ${i + 1} no tiene texto.`;
      if (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE') {
        if (q.options.length < 2) return `La pregunta ${i + 1} necesita al menos 2 opciones.`;
        if (q.options.some((o: any) => !o.optionText.trim()))
          return `Todas las opciones de la pregunta ${i + 1} deben tener texto.`;
      }
    }
     if (!this.surveyForm.deadline) return 'La fecha límite es obligatoria.';
        if (new Date(this.surveyForm.deadline) <= new Date())
          return 'La fecha límite debe ser futura.';
        return '';
}

  submitCreate(): void {
    const err = this.validateForm();
    if (err) { this.formError = err; return; }
    this.processing = true;
    const body = {
      ...this.surveyForm,
      deadline: this.surveyForm.deadline ? this.surveyForm.deadline + ':00' : null,
      questions: this.surveyForm.questions.map((q, i) => ({ ...q, displayOrder: i }))
    };
    this.http.post<any>(
      `${environment.apiUrl}/api/events/${this.eventId}/surveys`,
      body, { withCredentials: true }
    ).subscribe({
      next: () => { this.showCreateModal = false; this.processing = false; this.loadSurveys(); },
      error: err => {
        this.formError = err.error?.message || 'Error al crear la encuesta.';
        this.processing = false;
      }
    });
  }

  // ── Publicar (RF131) ──────────────────────────────────────────────────────
  openPublishConfirm(surveyId: number): void {
    this.publishSurveyId = surveyId;
    this.showPublishConfirmModal = true;
  }

 confirmPublish(): void {
  if (!this.publishSurveyId) return;
  this.processing = true;
  this.http.patch<any>(
    `${environment.apiUrl}/api/events/${this.eventId}/surveys/${this.publishSurveyId}/publish`,
    {}, { withCredentials: true }
  ).subscribe({
    next: () => {
      this.showPublishConfirmModal = false;
      this.processing = false;
      this.loadSurveys();
    },
    error: () => {
    this.showPublishConfirmModal = false;
    this.processing = false;
  }
  });
}

  // ── Cancelar (RF132) ──────────────────────────────────────────────────────
  openCancelModal(surveyId: number): void {
    this.cancelSurveyId = surveyId;
    this.cancelReason = '';
    this.cancelError = '';
    this.showCancelModal = true;
  }

  submitCancel(): void {
    if (!this.cancelReason.trim()) { this.cancelError = 'El motivo es obligatorio.'; return; }
    this.processing = true;
    this.http.patch<any>(
      `${environment.apiUrl}/api/events/${this.eventId}/surveys/${this.cancelSurveyId}/cancel`,
      { cancelReason: this.cancelReason }, { withCredentials: true }
    ).subscribe({
      next: () => {
        this.showCancelModal = false;
        this.processing = false;
        this.loadSurveys();
      },
      error: err => {
        this.cancelError = err.error?.message || 'Error al cancelar.';
        this.processing = false;
      }
    });
  }


  // ── Helpers ───────────────────────────────────────────────────────────────
  get canCreate(): boolean {
    return this.isOrganizer &&
      (this.eventStatus === 'IN_PROGRESS' || this.eventStatus === 'PUBLISHED');
  }

  getStatusClass(status: string): string {
    return {
      DRAFT: 'status--draft',
      PUBLISHED: 'status--published',
      CLOSED: 'status--finished',
      CANCELLED: 'status--cancelled'
    }[status] || '';
  }

  getStatusLabel(status: string): string {
    return {
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicada',
      CLOSED: 'Finalizada',
      CANCELLED: 'Cancelada'
    }[status] || status;
  }

  getRoleLabel(role: string): string {
    return {
      PARTICIPANT: 'Participantes', ATTENDEE: 'Asistentes',
      JUDGE: 'Jurados', STAFF: 'Personal'
    }[role] || role;
  }

  getRolesDisplay(roles: string[]): string {
    if (!roles?.length) return '—';
    return roles.map(r => this.getRoleLabel(r)).join(', ');
  }

  getQuestionTypeLabel(type: string): string {
    return {
      SINGLE_CHOICE: 'Opción única', MULTIPLE_CHOICE: 'Múltiple opción',
      OPEN_TEXT: 'Texto abierto', RATING: 'Calificación'
    }[type] || type;
  }

}