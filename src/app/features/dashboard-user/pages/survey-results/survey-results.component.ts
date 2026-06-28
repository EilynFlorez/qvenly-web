import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-survey-results',
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.scss']
})
export class SurveyResultsComponent implements OnChanges {

  @Input() eventId!: number;
  @Input() surveyId!: number;
  @Output() onBack = new EventEmitter<void>();

  results: any = null;
  loading = false;
  error = false;
  roleFilter = '';

  availableRoles = [
    { value: 'PARTICIPANT', label: 'Participantes' },
    { value: 'ATTENDEE',    label: 'Asistentes' },
    { value: 'JUDGE',       label: 'Jurados' },
    { value: 'STAFF',       label: 'Personal de apoyo' }
  ];

  constructor(private http: HttpClient) {}

  ngOnChanges(): void {
    if (this.eventId && this.surveyId) {
      this.loadResults();
    }
  }

  loadResults(): void {
    this.loading = true;
    this.error = false;
    const params = this.roleFilter ? `?roleFilter=${this.roleFilter}` : '';
    this.http.get<any>(
      `${environment.apiUrl}/api/events/${this.eventId}/surveys/${this.surveyId}/results${params}`,
      { withCredentials: true }
    ).subscribe({
      next: res => { this.results = res.data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  onRoleFilterChange(): void {
    this.loadResults();
  }

  goBack(): void {
    this.onBack.emit();
  }

  getQuestionTypeLabel(type: string): string {
    return {
      SINGLE_CHOICE: 'Opción única',
      MULTIPLE_CHOICE: 'Múltiple opción',
      OPEN_TEXT: 'Texto abierto',
      RATING: 'Calificación'
    }[type] || type;
  }

  getBarWidth(count: number, total: number): string {
    if (!total) return '0%';
    return Math.round((count / total) * 100) + '%';
  }

  getBarPercent(count: number, total: number): number {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getRoleLabel(role: string): string {
    return {
      PARTICIPANT: 'Participantes', ATTENDEE: 'Asistentes',
      JUDGE: 'Jurados', STAFF: 'Personal'
    }[role] || role;
  }

  get canFilter(): boolean {
  return (this.results?.targetRoles?.length || 0) > 1;
}

getRatingCount(distribution: Record<number, number>, star: number): number {
  return distribution?.[star] ?? 0;
}

getRatingBarWidth(distribution: Record<number, number>, star: number, total: number): string {
  if (!total || !distribution) return '0%';
  return Math.round((distribution[star] / total) * 100) + '%';
}
}