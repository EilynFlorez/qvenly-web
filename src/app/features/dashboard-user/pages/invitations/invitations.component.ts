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

  invitationSearchTerm = '';
  invitationStatusFilter: 'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED' = 'ALL';

  get filteredInvitations(): InvitationResponse[] {
    let result = this.invitations;
    if (this.invitationStatusFilter !== 'ALL') {
      result = result.filter(i => i.status === this.invitationStatusFilter);
    }
    if (this.invitationSearchTerm.trim()) {
      const term = this.invitationSearchTerm.trim().toLowerCase();
      result = result.filter(i =>
        (i.eventTitle && i.eventTitle.toLowerCase().includes(term)) ||
        (i.invitedByEmail && i.invitedByEmail.toLowerCase().includes(term))
      );
    }
    return result;
  }

  constructor(private invitationService: InvitationService) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.invitationService.getMyInvitations().subscribe({
      next: (res) => {
        if (res.success) this.invitations = res.data;
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente', ACCEPTED: 'Aceptada',
      DECLINED: 'Rechazada', CANCELLED: 'Cancelada', EXPIRED: 'Vencida'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'invite-status--pending', ACCEPTED: 'invite-status--accepted',
      DECLINED: 'invite-status--declined', CANCELLED: 'invite-status--cancelled',
      EXPIRED: 'invite-status--expired'
    };
    return map[status] || '';
  }

  getRoleLabel(role: EventRole): string {
    const labels: Record<EventRole, string> = {
      ORGANIZER: 'Organizador', STAFF: 'Personal de apoyo',
      JUDGE: 'Juez', PARTICIPANT: 'Participante', ATTENDEE: 'Asistente', MEMBER: 'Miembro'
    };
    return labels[role];
  }

  getRoleClass(role: EventRole): string {
    const classes: Record<EventRole, string> = {
      ORGANIZER: 'role--organizer', STAFF: 'role--staff',
      JUDGE: 'role--judge', PARTICIPANT: 'role--participant', ATTENDEE: 'role--attendee', MEMBER: 'role--member'
    };
    return classes[role];
  }
}
