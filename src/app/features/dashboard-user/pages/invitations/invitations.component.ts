import { Component, OnInit } from '@angular/core';
import { InvitationService } from '../../../../core/core-events/services/invitation.service';
import { InvitationResponse, EventRole } from '../../../../core/core-events/models/event.model';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent implements OnInit {

  invitations: InvitationResponse[] = [];
  loading = true;
  error = '';
  successMessage = '';
  accepting: number | null = null;

  constructor(private invitationService: InvitationService) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.invitationService.getMyPendingInvitations().subscribe({
      next: (res) => {
        if (res.success) this.invitations = res.data.filter(i => i.status === 'PENDING');
        this.loading = false;
      },
      error: () => { this.error = 'No se pudieron cargar las invitaciones.'; this.loading = false; }
    });
  }

  onAccept(inv: InvitationResponse): void {
    this.accepting = inv.id;
    this.error = '';
    this.successMessage = '';

    this.invitationService.acceptInvitation(inv.token).subscribe({
      next: () => {
        this.successMessage = 'Invitación aceptada. ¡Ya eres parte del evento!';
        this.accepting = null;
        this.loadInvitations();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al aceptar la invitación.';
        this.accepting = null;
      }
    });
  }

  getRoleLabel(role: EventRole): string {
    const labels: Record<EventRole, string> = {
      ORGANIZER: 'Organizador', STAFF: 'Personal de apoyo',
      JUDGE: 'Juez', PARTICIPANT: 'Participante', ATTENDEE: 'Asistente'
    };
    return labels[role];
  }

  getRoleClass(role: EventRole): string {
    const classes: Record<EventRole, string> = {
      ORGANIZER: 'role--organizer', STAFF: 'role--staff',
      JUDGE: 'role--judge', PARTICIPANT: 'role--participant', ATTENDEE: 'role--attendee'
    };
    return classes[role];
  }
}
