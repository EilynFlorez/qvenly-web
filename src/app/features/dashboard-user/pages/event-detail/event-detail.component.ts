import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../core/core-events/services/event.service';
import { InvitationService } from '../../../../core/core-events/services/invitation.service';
import {
  EventResponse, EventMember, LimitsUsage, AuditLog,
  InvitationResponse, EventStatus, EventRole
} from '../../../../core/core-events/models/event.model';
import { ActivityService } from '../../../../core/core-activities/services/activity.service';
import {
  ActivityResponse, ActivityMember, AuditLogActivity,
  ActivityMemberRole, ActivityStatus
} from '../../../../core/core-activities/models/activity.model';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {

  event: EventResponse | null = null;
  members: EventMember[] = [];
  limits: LimitsUsage | null = null;
  auditLog: AuditLog[] = [];
  invitations: InvitationResponse[] = [];

  loading = true;
  error = false;
  processing = false;
  actionError = '';

  readonly ROLES: EventRole[] = ['ORGANIZER', 'STAFF', 'JUDGE', 'PARTICIPANT', 'ATTENDEE'];

  activeTab: 'general' | 'members' | 'invitations' | 'activities' | 'budget' | 'audit' = 'general';

  // ── Actividades ──────────────────────────────────────────────────────────────
  activities: ActivityResponse[] = [];
  activitiesLoading = false;
  activitiesError = false;
  selectedActivity: ActivityResponse | null = null;
  activityMembers: ActivityMember[] = [];
  activityMembersLoading = false;
  myActivityAssignments: Set<number> = new Set();
  activityAuditLog: AuditLogActivity[] = [];

  showCreateActivityModal = false;
  showEditActivityModal = false;
  showCancelActivityModal = false;
  cancelActivityId: number | null = null;
  cancelActivityReason = '';

  showAssignMemberModal = false;
  assignActivityId: number | null = null;
  assignMemberEmail = '';
  assignMemberRole: ActivityMemberRole = 'PARTICIPANT';
  assignMemberFunction = '';
  assignMemberError = '';

  showActivityDetailModal = false;
  activityMembersLoading2 = false;

  activityForm = {
    title: '',
    description: '',
    location: '',
    startDatetime: '',
    endDatetime: '',
    enrollmentEnabled: false,
    maxEnrollment: null as number | null
  };
  editingActivityId: number | null = null;
  activityFormError = '';

  // ── Modal states ────────────────────────────────────────────────────────────
  showCancelEventModal = false;
  cancelEventReason = '';

  showInviteModal = false;
  inviteEmail = '';
  inviteRole: EventRole = 'PARTICIPANT';
  inviteError = '';

  showRemoveMemberModal = false;
  removeMemberId: number | null = null;
  removeMemberEmail = '';
  removeReason = '';

  showChangeRoleModal = false;
  changeRoleMemberId: number | null = null;
  changeRoleMemberEmail = '';
  newRole: EventRole = 'PARTICIPANT';

  showCancelInviteModal = false;
  cancelInviteId: number | null = null;
  cancelInviteReason = '';

  showLeaveModal = false;
  leaveReason = '';

  private currentUserEmail = localStorage.getItem('email') || '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private invitationService: InvitationService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = true; this.loading = false; return; }
    this.loadAll(id);
  }

  loadAll(id: number): void {
    this.loading = true;
    this.error = false;
    let done = 0;
    const total = 4;
    const check = () => { done++; if (done === total) this.loading = false; };

    this.eventService.getEventById(id).subscribe({
      next: (res) => { if (res.success) this.event = res.data; check(); },
      error: () => { this.error = true; this.loading = false; }
    });

    this.eventService.getMembers(id).subscribe({
      next: (res) => { if (res.success) this.members = res.data; check(); },
      error: () => check()
    });

    this.eventService.getLimits(id).subscribe({
      next: (res) => { if (res.success) this.limits = res.data; check(); },
      error: () => check()
    });

    this.eventService.getAuditLog(id).subscribe({
      next: (res) => { if (res.success) this.auditLog = res.data; check(); },
      error: () => check()
    });
  }

  private reloadEvent(): void {
    if (!this.event) return;
    const id = this.event.id;
    this.eventService.getEventById(id).subscribe({ next: (r) => { if (r.success) this.event = r.data; } });
    this.eventService.getMembers(id).subscribe({ next: (r) => { if (r.success) this.members = r.data; } });
    this.eventService.getLimits(id).subscribe({ next: (r) => { if (r.success) this.limits = r.data; } });
    this.eventService.getAuditLog(id).subscribe({ next: (r) => { if (r.success) this.auditLog = r.data; } });
    this.invitationService.getInvitations(id).subscribe({ next: (r) => { if (r.success) this.invitations = r.data; } });
  }

  loadInvitations(): void {
    if (!this.event) return;
    this.invitationService.getInvitations(this.event.id).subscribe({
      next: (res) => { if (res.success) this.invitations = res.data; }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab as any;
    if (tab === 'invitations' && this.invitations.length === 0 && this.event) {
      this.loadInvitations();
    }
    if (tab === 'activities' && this.activities.length === 0 && this.event) {
      this.loadActivities();
    }
  }

  // ── Computed ─────────────────────────────────────────────────────────────────
  get isOrganizer(): boolean {
    if (this.members.length > 0) {
      return this.members.some(m =>
        m.userEmail === this.currentUserEmail && m.eventRole === 'ORGANIZER' && m.status === 'ACTIVE'
      );
    }
    return this.event?.ownerEmail === this.currentUserEmail;
  }

  get canLeave(): boolean {
    const m = this.members.find(x => x.userEmail === this.currentUserEmail && x.status === 'ACTIVE');
    return !!m && m.eventRole !== 'ORGANIZER';
  }

  get canEdit(): boolean {
    return this.isOrganizer && !!this.event &&
      this.event.status !== 'FINISHED' && this.event.status !== 'CANCELLED';
  }

  get sortedAuditLog(): AuditLog[] {
    return [...this.auditLog].sort((a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }

  getMembersByRole(role: EventRole): EventMember[] {
    return this.members.filter(m => m.eventRole === role && m.status === 'ACTIVE');
  }

  getRoleLabel(role: EventRole): string {
    const labels: Record<EventRole, string> = {
      ORGANIZER: 'Organizadores', STAFF: 'Personal de apoyo',
      JUDGE: 'Jueces', PARTICIPANT: 'Participantes', ATTENDEE: 'Asistentes'
    };
    return labels[role];
  }

  getStatusLabel(status: EventStatus): string {
    const labels: Record<EventStatus, string> = {
      DRAFT: 'Borrador', PUBLISHED: 'Publicado',
      IN_PROGRESS: 'En proceso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: EventStatus): string {
    const classes: Record<EventStatus, string> = {
      DRAFT: 'status--draft', PUBLISHED: 'status--published',
      IN_PROGRESS: 'status--inprogress', FINISHED: 'status--finished', CANCELLED: 'status--cancelled'
    };
    return classes[status] || '';
  }

  getInviteStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'invite-status--pending', ACCEPTED: 'invite-status--accepted',
      DECLINED: 'invite-status--declined', CANCELLED: 'invite-status--cancelled',
      EXPIRED: 'invite-status--expired'
    };
    return map[status] || '';
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

  getPercent(current: number, max: number): number {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  }

  isMe(email: string): boolean {
    return email === this.currentUserEmail;
  }

  isOnlyOrganizer(member: EventMember): boolean {
    const organizers = this.getMembersByRole('ORGANIZER');
    return member.eventRole === 'ORGANIZER' && organizers.length === 1;
  }

  // ── Event actions ────────────────────────────────────────────────────────────
  publishEvent(): void {
    if (!this.event) return;
    this.processing = true; this.actionError = '';
    this.eventService.publishEvent(this.event.id).subscribe({
      next: (r) => { if (r.success) this.event = r.data; this.processing = false; },
      error: (err) => { this.actionError = err.error?.message || 'Error al publicar.'; this.processing = false; }
    });
  }

  startEvent(): void {
    if (!this.event) return;
    this.processing = true; this.actionError = '';
    this.eventService.startEvent(this.event.id).subscribe({
      next: (r) => { if (r.success) this.event = r.data; this.processing = false; },
      error: (err) => { this.actionError = err.error?.message || 'Error al iniciar.'; this.processing = false; }
    });
  }

  finishEvent(): void {
    if (!this.event) return;
    this.processing = true; this.actionError = '';
    this.eventService.finishEvent(this.event.id).subscribe({
      next: (r) => { if (r.success) this.event = r.data; this.processing = false; },
      error: (err) => { this.actionError = err.error?.message || 'Error al finalizar.'; this.processing = false; }
    });
  }

  submitCancelEvent(): void {
    if (!this.event || !this.cancelEventReason.trim()) return;
    this.processing = true; this.actionError = '';
    this.eventService.cancelEvent(this.event.id, this.cancelEventReason).subscribe({
      next: (r) => {
        if (r.success) this.event = r.data;
        this.showCancelEventModal = false; this.cancelEventReason = '';
        this.processing = false;
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al cancelar.'; this.processing = false; }
    });
  }

  editEvent(): void {
    if (!this.event) return;
    this.router.navigate(['/dashboard-user/events', this.event.id, 'edit']);
  }

  // ── Members ──────────────────────────────────────────────────────────────────
  openInviteModal(): void {
    this.inviteEmail = ''; this.inviteRole = 'PARTICIPANT'; this.inviteError = '';
    this.showInviteModal = true;
    if (this.invitations.length === 0) this.loadInvitations();
  }

  submitInvite(): void {
    if (!this.event || !this.inviteEmail.trim()) return;
    this.processing = true; this.inviteError = '';
    this.invitationService.sendInvitation(this.event.id, this.inviteEmail.trim(), this.inviteRole).subscribe({
      next: () => {
        this.showInviteModal = false; this.processing = false;
        this.loadInvitations();
      },
      error: (err) => { this.inviteError = err.error?.message || 'Error al enviar invitación.'; this.processing = false; }
    });
  }

  openRemoveMember(member: EventMember): void {
    this.removeMemberId = member.id; this.removeMemberEmail = member.userEmail;
    this.removeReason = ''; this.showRemoveMemberModal = true;
  }

  submitRemoveMember(): void {
    if (!this.event || !this.removeMemberId || !this.removeReason.trim()) return;
    this.processing = true; this.actionError = '';
    this.eventService.removeMember(this.event.id, this.removeMemberId, this.removeReason).subscribe({
      next: () => {
        this.showRemoveMemberModal = false; this.processing = false;
        this.members = this.members.filter(m => m.id !== this.removeMemberId);
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al eliminar miembro.'; this.processing = false; }
    });
  }

  openChangeRole(member: EventMember): void {
    this.changeRoleMemberId = member.id; this.changeRoleMemberEmail = member.userEmail;
    this.newRole = member.eventRole; this.showChangeRoleModal = true;
  }

  submitChangeRole(): void {
    if (!this.event || !this.changeRoleMemberId) return;
    this.processing = true; this.actionError = '';
    this.eventService.changeMemberRole(this.event.id, this.changeRoleMemberId, this.newRole).subscribe({
      next: () => {
        this.showChangeRoleModal = false; this.processing = false;
        this.members = this.members.map(m =>
          m.id === this.changeRoleMemberId ? { ...m, eventRole: this.newRole } : m
        );
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al cambiar rol.'; this.processing = false; }
    });
  }

  submitLeave(): void {
    if (!this.event || !this.leaveReason.trim()) return;
    this.processing = true; this.actionError = '';
    this.eventService.leaveEvent(this.event.id, this.leaveReason).subscribe({
      next: () => { this.router.navigate(['/dashboard-user/events']); },
      error: (err) => { this.actionError = err.error?.message || 'Error al abandonar evento.'; this.processing = false; }
    });
  }

  // ── Invitations ───────────────────────────────────────────────────────────────
  openCancelInvite(inv: InvitationResponse): void {
    this.cancelInviteId = inv.id; this.cancelInviteReason = ''; this.showCancelInviteModal = true;
  }

  submitCancelInvite(): void {
    if (!this.event || !this.cancelInviteId || !this.cancelInviteReason.trim()) return;
    this.processing = true; this.actionError = '';
    this.invitationService.cancelInvitation(this.event.id, this.cancelInviteId, this.cancelInviteReason).subscribe({
      next: () => {
        this.showCancelInviteModal = false; this.processing = false;
        this.invitations = this.invitations.map(i =>
          i.id === this.cancelInviteId ? { ...i, status: 'CANCELLED' } : i
        );
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al cancelar invitación.'; this.processing = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard-user/events']);
  }

  // ── Actividades ──────────────────────────────────────────────────────────────

  loadActivities(): void {
    if (!this.event) return;
    this.activitiesLoading = true;
    this.activitiesError = false;
    this.activityService.getActivitiesByEvent(this.event.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.activities = res.data;
          this.loadMyActivityAssignments();
        }
        this.activitiesLoading = false;
      },
      error: () => { this.activitiesError = true; this.activitiesLoading = false; }
    });
  }

  loadMyActivityAssignments(): void {
    if (!this.event || this.isOrganizer) return;
    this.myActivityAssignments = new Set();
    this.activities.forEach(activity => {
      this.activityService.getMembersByActivity(activity.id).subscribe({
        next: (res) => {
          if (res.success) {
            const isAssigned = res.data.some(
              (m: ActivityMember) => m.userEmail === this.currentUserEmail && m.status === 'ACTIVE'
            );
            if (isAssigned) this.myActivityAssignments.add(activity.id);
          }
        }
      });
    });
  }

  openCreateActivity(): void {
    this.editingActivityId = null;
    this.activityForm = { title: '', description: '', location: '',
      startDatetime: '', endDatetime: '', enrollmentEnabled: false, maxEnrollment: null };
    this.activityFormError = '';
    this.showCreateActivityModal = true;
  }

  openEditActivity(activity: ActivityResponse): void {
    this.editingActivityId = activity.id;
    this.activityForm = {
      title: activity.title,
      description: activity.description || '',
      location: activity.location || '',
      startDatetime: activity.startDatetime.replace(' ', 'T').substring(0, 16),
      endDatetime: activity.endDatetime.replace(' ', 'T').substring(0, 16),
      enrollmentEnabled: activity.enrollmentEnabled,
      maxEnrollment: activity.maxEnrollment
    };
    this.activityFormError = '';
    this.showEditActivityModal = true;
  }

  submitCreateActivity(): void {
    if (!this.event || !this.activityForm.title.trim()) return;
    this.processing = true; this.activityFormError = '';
    const data = {
      eventId: this.event.id,
      title: this.activityForm.title,
      description: this.activityForm.description || undefined,
      location: this.activityForm.location || undefined,
      startDatetime: this.activityForm.startDatetime,
      endDatetime: this.activityForm.endDatetime,
      enrollmentEnabled: this.activityForm.enrollmentEnabled,
      maxEnrollment: this.activityForm.maxEnrollment || undefined
    };
    this.activityService.createActivity(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.activities = [...this.activities, res.data];
          this.showCreateActivityModal = false;
        }
        this.processing = false;
      },
      error: (err) => {
        this.activityFormError = err.error?.message || 'Error al crear la actividad.';
        this.processing = false;
      }
    });
  }

  submitEditActivity(): void {
    if (!this.editingActivityId || !this.activityForm.title.trim()) return;
    this.processing = true; this.activityFormError = '';
    const data = {
      title: this.activityForm.title,
      description: this.activityForm.description || undefined,
      location: this.activityForm.location || undefined,
      startDatetime: this.activityForm.startDatetime,
      endDatetime: this.activityForm.endDatetime,
      enrollmentEnabled: this.activityForm.enrollmentEnabled,
      maxEnrollment: this.activityForm.maxEnrollment || undefined
    };
    this.activityService.updateActivity(this.editingActivityId, data).subscribe({
      next: (res) => {
        if (res.success) {
          this.activities = this.activities.map(a =>
            a.id === this.editingActivityId ? res.data : a);
          this.showEditActivityModal = false;
        }
        this.processing = false;
      },
      error: (err) => {
        this.activityFormError = err.error?.message || 'Error al editar la actividad.';
        this.processing = false;
      }
    });
  }

  startActivity(id: number): void {
    this.processing = true;
    this.activityService.startActivity(id).subscribe({
      next: (res) => {
        if (res.success) this.activities = this.activities.map(a => a.id === id ? res.data : a);
        this.processing = false;
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al iniciar.'; this.processing = false; }
    });
  }

  finishActivity(id: number): void {
    this.processing = true;
    this.activityService.finishActivity(id).subscribe({
      next: (res) => {
        if (res.success) this.activities = this.activities.map(a => a.id === id ? res.data : a);
        this.processing = false;
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al finalizar.'; this.processing = false; }
    });
  }

  openCancelActivity(id: number): void {
    this.cancelActivityId = id;
    this.cancelActivityReason = '';
    this.showCancelActivityModal = true;
  }

  submitCancelActivity(): void {
    if (!this.cancelActivityId || !this.cancelActivityReason.trim()) return;
    this.processing = true;
    this.activityService.cancelActivity(this.cancelActivityId, this.cancelActivityReason).subscribe({
      next: (res) => {
        if (res.success) this.activities = this.activities.map(a =>
          a.id === this.cancelActivityId ? res.data : a);
        this.showCancelActivityModal = false;
        this.processing = false;
      },
      error: (err) => { this.actionError = err.error?.message || 'Error al cancelar.'; this.processing = false; }
    });
  }

  openAssignMember(activityId: number): void {
    this.assignActivityId = activityId;
    this.assignMemberEmail = '';
    this.assignMemberRole = 'PARTICIPANT';
    this.assignMemberFunction = '';
    this.assignMemberError = '';
    this.showAssignMemberModal = true;
  }

  submitAssignMember(): void {
    if (!this.assignActivityId || !this.assignMemberEmail.trim()) return;
    this.processing = true; this.assignMemberError = '';
    this.activityService.assignMember(this.assignActivityId, {
      userEmail: this.assignMemberEmail.trim(),
      eventRole: this.assignMemberRole,
      functionDescription: this.assignMemberFunction || undefined
    }).subscribe({
      next: () => {
        this.showAssignMemberModal = false;
        this.processing = false;
      },
      error: (err) => {
        this.assignMemberError = err.error?.message || 'Error al asignar miembro.';
        this.processing = false;
      }
    });
  }

  openActivityDetail(activity: ActivityResponse): void {
    this.selectedActivity = activity;
    this.activityMembersLoading = true;
    this.showActivityDetailModal = true;
    this.activityService.getMembersByActivity(activity.id).subscribe({
      next: (res) => {
        if (res.success) this.activityMembers = res.data;
        this.activityMembersLoading = false;
      },
      error: () => { this.activityMembersLoading = false; }
    });
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
      PARTICIPANT: 'Participante', JUDGE: 'Jurado', STAFF: 'Personal de apoyo'
    };
    return labels[role] || role;
  }
}