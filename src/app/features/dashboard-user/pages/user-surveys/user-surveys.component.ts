import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/core-events/services/event.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PendingSurvey, SurveyDetail, SurveyQuestion } from '../../../../core/core-events/models/survey.model';
import { SurveyService } from '../../../../core/core-events/services/survey.service';

@Component({
  selector: 'app-user-surveys',
  templateUrl: './user-surveys.component.html',
  styleUrls: ['./user-surveys.component.scss']
})
export class UserSurveysComponent implements OnInit {

  loading = true;
  error = false;
  surveys: PendingSurvey[] = [];

  // Vista responder
  selectedSurvey: SurveyDetail | null = null;
  selectedEventId: number | null = null;
  loadingDetail = false;
  submitting = false;
  submitError = '';
  submitSuccess = false;
  answers: Record<number, any> = {};

  constructor(
    private eventService: EventService,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.loadPendingSurveys();
  }

  loadPendingSurveys(): void {
    this.loading = true;
    this.error = false;

    this.eventService.getMyEvents().subscribe({
      next: res => {
        const events = res.data || [];
        if (!events.length) { this.loading = false; return; }

        const requests = events.map(e =>
          this.surveyService.getPendingSurveys(e.id).pipe(
            map((r: any) => (r.data || []).map((s: PendingSurvey) => ({
              ...s, eventId: e.id, eventTitle: e.title
            }))),
            catchError(() => of([]))
          )
        );

        forkJoin(requests).subscribe({
          next: results => {
            this.surveys = (results as PendingSurvey[][]).flat();
            this.loading = false;
          },
          error: () => { this.error = true; this.loading = false; }
        });
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  openSurvey(survey: PendingSurvey): void {
    this.loadingDetail = true;
    this.selectedEventId = survey.eventId!;
    this.answers = {};
    this.submitError = '';
    this.submitSuccess = false;

    this.surveyService.getSurveyDetail(survey.eventId!, survey.id).subscribe({
      next: res => {
        this.selectedSurvey = res.data;
        this.loadingDetail = false;
        // inicializar answers
        res.data.questions.forEach((q: SurveyQuestion) => {
          if (q.questionType === 'MULTIPLE_CHOICE') this.answers[q.id] = [];
          else this.answers[q.id] = null;
        });
      },
      error: () => { this.loadingDetail = false; }
    });
  }

  goBack(): void {
    this.selectedSurvey = null;
    this.selectedEventId = null;
  }

  setRating(questionId: number, value: number): void {
    this.answers[questionId] = value;
  }

  toggleMultiple(questionId: number, optionId: number): void {
    const arr: number[] = this.answers[questionId] || [];
    const idx = arr.indexOf(optionId);
    if (idx === -1) arr.push(optionId);
    else arr.splice(idx, 1);
    this.answers[questionId] = [...arr];
  }

  isSelected(questionId: number, optionId: number): boolean {
    return (this.answers[questionId] || []).includes(optionId);
  }

  getRoleLabel(role: string): string {
    return { PARTICIPANT: 'Participantes', ATTENDEE: 'Asistentes',
             JUDGE: 'Jurados', STAFF: 'Personal' }[role] || role;
  }

  getMyRole(): string {
    // El rol en el evento lo inferimos del targetRoles de la encuesta
    // El backend ya validó que el usuario puede responder
    return this.selectedSurvey?.targetRoles?.[0] || 'ATTENDEE';
  }

  submit(): void {
    if (!this.selectedSurvey) return;
    this.submitError = '';

    const answersPayload = this.selectedSurvey.questions.map(q => {
      const val = this.answers[q.id];
      if (q.questionType === 'OPEN_TEXT') {
        return { questionId: q.id, openAnswer: val || '' };
      } else if (q.questionType === 'RATING') {
        return { questionId: q.id, openAnswer: val ? String(val) : '' };
      } else if (q.questionType === 'MULTIPLE_CHOICE') {
        return { questionId: q.id, selectedOptionIds: val || [] };
      } else {
        return { questionId: q.id, selectedOptionId: val };
      }
    });

    const body = {
      respondentRole: this.getMyRole(),
      answers: answersPayload
    };

    this.submitting = true;
    this.surveyService.submitResponse(
      this.selectedEventId!, this.selectedSurvey.id, body
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        // Quitar la encuesta respondida de la lista
        this.surveys = this.surveys.filter(s => s.id !== this.selectedSurvey!.id);
        setTimeout(() => this.goBack(), 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err.error?.message || 'Error al enviar la respuesta.';
      }
    });
  }
}