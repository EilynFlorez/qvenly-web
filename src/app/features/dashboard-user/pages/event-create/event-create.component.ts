import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/core-events/services/event.service';

function endAfterStartValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDatetime')?.value;
  const end = control.get('endDatetime')?.value;
  if (start && end && end <= start) return { endBeforeStart: true };
  return null;
}

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent {

  form: FormGroup;
  submitting = false;
  submitError = '';
  noPlanError = false;
  limitError = false;

  readonly eventTypes = [
    { value: 'CONFERENCIA', label: 'Conferencia' },
    { value: 'COMPETENCIA', label: 'Competencia' },
    { value: 'TALLER',      label: 'Taller' },
    { value: 'SEMINARIO',   label: 'Seminario' },
    { value: 'CONGRESO',    label: 'Congreso' },
    { value: 'OTRO',        label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title:         ['', [Validators.required, Validators.maxLength(150)]],
      eventType:     ['CONFERENCIA', Validators.required],
      description:   ['', Validators.maxLength(500)],
      location:      [''],
      startDatetime: ['', Validators.required],
      endDatetime:   ['', Validators.required]
    }, { validators: endAfterStartValidator });
  }

  get f() { return this.form.controls; }

  private toIso(dt: string): string {
    if (!dt) return '';
    return dt.length === 16 ? dt + ':00' : dt;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitError = '';
    this.noPlanError = false;
    this.limitError = false;

    const v = this.form.value;
    this.eventService.createEvent({
      title:         v.title.trim(),
      eventType:     v.eventType,
      description:   v.description?.trim() || '',
      location:      v.location?.trim() || '',
      startDatetime: this.toIso(v.startDatetime),
      endDatetime:   this.toIso(v.endDatetime)
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard-user/events', res.data.id]);
        } else {
          this.submitError = res.message || 'Error al crear el evento.';
          this.submitting = false;
        }
      },
      error: (err) => {
        if (err.status === 403) this.noPlanError = true;
        else if (err.status === 422) {
          this.limitError = true;
          this.submitError = err.error?.message || 'Límite de eventos del plan alcanzado.';
        } else {
          this.submitError = err.error?.message || 'Error al crear el evento. Intenta de nuevo.';
        }
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard-user/events']);
  }
}
