import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  CreateSupportTicketRequest,
  SupportTicketPriority,
  SupportTicketType
} from '../../../../core/core-user-help/models/user-help.model';
import { UserHelpService } from '../../../../core/core-user-help/services/user-help.service';

@Component({
  selector: 'app-support-form',
  templateUrl: './support-form.component.html',
  styleUrl: './support-form.component.scss'
})
export class SupportFormComponent {

  @Output() ticketCreated = new EventEmitter<void>();

  readonly ticketTypes: Array<{ value: SupportTicketType; label: string }> = [
    { value: 'TECHNICAL', label: 'Técnico' },
    { value: 'ACCOUNT', label: 'Cuenta' },
    { value: 'EVENT', label: 'Evento' },
    { value: 'PLAN', label: 'Plan' },
    { value: 'OTHER', label: 'Otro' }
  ];

  readonly priorities: Array<{ value: SupportTicketPriority; label: string }> = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' }
  ];

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    type: ['TECHNICAL' as SupportTicketType, Validators.required],
    description: ['', [Validators.required, Validators.minLength(12)]],
    priority: ['MEDIUM' as SupportTicketPriority, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private userHelpService: UserHelpService
  ) { }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa los campos obligatorios para registrar la solicitud.';
      return;
    }

    const request: CreateSupportTicketRequest = this.form.getRawValue();
    this.loading = true;

    this.userHelpService.createSupportTicket(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Solicitud enviada correctamente. El equipo de soporte la revisará.';
        this.form.reset({
          type: 'TECHNICAL',
          description: '',
          priority: 'MEDIUM'
        });
        this.ticketCreated.emit();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No pudimos registrar tu solicitud. Intenta nuevamente.';
      }
    });
  }
}
