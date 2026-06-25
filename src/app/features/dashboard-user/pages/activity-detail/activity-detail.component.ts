import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../../../core/core-activities/services/activity.service';
import {
  ActivityResponse, ActivityMember, ActivityStatus,
  ActivityImageResponse, AuditLogActivity
} from '../../../../core/core-activities/models/activity.model';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {
  activity: ActivityResponse | null = null;
  activityMembers: ActivityMember[] = [];
  activityImages: ActivityImageResponse[] = [];
  auditLog: AuditLogActivity[] = [];
  auditLoading = false;

  loading = true;
  error = false;
  membersLoading = false;
  imagesLoading = false;

  memberRoleFilter: 'ALL' | 'STAFF' | 'JUDGE' | 'PARTICIPANT' | 'ATTENDEE' = 'ALL';
  memberSearchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = true; this.loading = false; return; }
    this.loadActivity(id);
  }

  private loadActivity(id: number): void {
    this.loading = true;
    this.error = false;
    this.activityService.getActivityById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.activity = res.data;
          this.loadMembers(id);
          this.loadImages(id);
          this.loadAuditLog(id);
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  private loadMembers(id: number): void {
    this.membersLoading = true;
    this.activityService.getMembersByActivity(id).subscribe({
      next: (res) => { if (res.success) this.activityMembers = res.data; this.membersLoading = false; },
      error: () => { this.membersLoading = false; }
    });
  }

  private loadImages(id: number): void {
    this.imagesLoading = true;
    this.activityService.getActivityImages(id).subscribe({
      next: (res) => { if (res.success) this.activityImages = res.data; this.imagesLoading = false; },
      error: () => { this.imagesLoading = false; }
    });
  }

  private loadAuditLog(id: number): void {
    this.auditLoading = true;
    this.activityService.getAuditLog(id).subscribe({
      next: (res) => { if (res.success) this.auditLog = res.data; this.auditLoading = false; },
      error: () => { this.auditLoading = false; }
    });
  }

  goBack(): void {
    if (this.activity) {
      this.router.navigate(['/dashboard-user/events', this.activity.eventId]);
    } else {
      this.router.navigate(['/dashboard-user/events']);
    }
  }

  get sortedAuditLog(): AuditLogActivity[] {
    return [...this.auditLog].sort((a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }

  get filteredActivityMembers(): ActivityMember[] {
    let result = this.activityMembers;
    if (this.memberRoleFilter !== 'ALL') {
      result = result.filter(m => m.eventRole === this.memberRoleFilter);
    }
    if (this.memberSearchTerm.trim()) {
      const term = this.memberSearchTerm.trim().toLowerCase();
      result = result.filter(m => m.userEmail.toLowerCase().includes(term));
    }
    return result;
  }

  getActivityStatusLabel(status: ActivityStatus): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente', IN_PROGRESS: 'En proceso',
      FINISHED: 'Finalizada', CANCELLED: 'Cancelada'
    };
    return labels[status] || status;
  }

  getActivityStatusClass(status: ActivityStatus): string {
    const classes: Record<string, string> = {
      PENDING: 'status--draft', IN_PROGRESS: 'status--inprogress',
      FINISHED: 'status--finished', CANCELLED: 'status--cancelled'
    };
    return classes[status] || '';
  }

  getActivityRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      PARTICIPANT: 'Participante', JUDGE: 'Jurado', STAFF: 'Personal de apoyo', ATTENDEE: 'Asistente'
    };
    return labels[role] || role;
  }

  getAuditActionLabel(actionType: string): string {
    const labels: Record<string, string> = {
      EVENT_CREATED: 'Evento creado', EVENT_PUBLISHED: 'Evento publicado',
      EVENT_STARTED: 'Evento iniciado', EVENT_FINISHED: 'Evento finalizado',
      EVENT_CANCELLED: 'Evento cancelado', EVENT_EDITED: 'Evento editado',
      INVITATION_SENT: 'Invitación enviada', INVITATION_CANCELLED: 'Invitación cancelada',
      MEMBER_ADDED: 'Miembro agregado', MEMBER_ROLE_CHANGED: 'Rol cambiado',
      MEMBER_REMOVED: 'Miembro eliminado', MEMBER_LEFT: 'Miembro abandonó el evento',
      ACTIVITY_CREATED: 'Actividad creada', ACTIVITY_EDITED: 'Actividad editada',
      ACTIVITY_STARTED: 'Actividad iniciada', ACTIVITY_FINISHED: 'Actividad finalizada',
      ACTIVITY_CANCELLED: 'Actividad cancelada', MEMBER_ASSIGNED: 'Miembro asignado',
      MEMBER_CONFIRMED: 'Miembro confirmado', MEMBER_CANCELLED: 'Asignación cancelada'
    };
    return labels[actionType] || actionType.replace(/_/g, ' ');
  }

  getAuditIcon(actionType: string): string {
    if (actionType.includes('CREATE'))  return 'ti-plus';
    if (actionType.includes('PUBLISH')) return 'ti-send';
    if (actionType.includes('START'))   return 'ti-player-play';
    if (actionType.includes('FINISH'))  return 'ti-flag-check';
    if (actionType.includes('CANCEL'))  return 'ti-x';
    if (actionType.includes('INVITE'))  return 'ti-user-plus';
    if (actionType.includes('MEMBER'))  return 'ti-users';
    if (actionType.includes('ROLE'))    return 'ti-arrows-exchange';
    if (actionType.includes('LEAVE'))   return 'ti-door-exit';
    if (actionType.includes('UPDATE'))  return 'ti-edit';
    return 'ti-history';
  }
}
