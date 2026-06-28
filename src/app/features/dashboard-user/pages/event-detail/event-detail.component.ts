import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../core/core-events/services/event.service';
import { InvitationService } from '../../../../core/core-events/services/invitation.service';
import {
  EventResponse, EventMember, LimitsUsage, AuditLog,
  InvitationResponse, EventStatus, EventRole, EventImageResponse
} from '../../../../core/core-events/models/event.model';
import { ActivityService } from '../../../../core/core-activities/services/activity.service';
import {
  ActivityResponse, ActivityMember, AuditLogActivity,
  ActivityMemberRole, ActivityStatus, ActivityImageResponse
} from '../../../../core/core-activities/models/activity.model';
import { AttendanceService } from '../../../../core/core-attendance/service/attendance.service';
import { AttendanceResponse } from '../../../../core/core-attendance/models/attendance.model';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit, OnDestroy {

  event: EventResponse | null = null;
  surveys: any[] = [];
  members: EventMember[] = [];
  limits: LimitsUsage | null = null;
  auditLog: AuditLog[] = [];
  invitations: InvitationResponse[] = [];
  invitationSearchTerm = '';
  invitationStatusFilter: 'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED' = 'ALL';

  loading = true;
  error = false;
  processing = false;
  actionError = '';

  readonly ROLES: EventRole[] = ['ORGANIZER', 'STAFF', 'MEMBER'];

  activeTab: 'general' | 'members' | 'invitations' | 'activities' |  'attendance' | 'budget' | 'audit' | 'surveys' = 'general';

  // ── Actividades ──────────────────────────────────────────────────────────────
  activities: ActivityResponse[] = [];
  activitiesLoading = false;
  activitiesError = false;
  myActivityAssignments: Set<number> = new Set();
  myStaffAssignedActivities: Set<number> = new Set();
  activityStatusFilter: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED' = 'ALL';
  activitySearchTerm = '';
  showOnlyMyActivities = false;
  activityAuditLog: AuditLogActivity[] = [];
  activityImages: ActivityImageResponse[] = [];
  activityImagesLoading = false;
  uploadingActivityImage = false;
  activityImageUploadError = '';
  newActivityPendingFiles: File[] = [];

  showCreateActivityModal = false;
  showEditActivityModal = false;
  showCancelActivityModal = false;
  cancelActivityId: number | null = null;
  cancelActivityReason = '';

  showAssignMemberModal = false;
  assignActivityId: number | null = null;
  assignMemberRole: ActivityMemberRole = 'PARTICIPANT';
  assignMemberRoleFilter: 'ALL' | 'STAFF' | 'MEMBER' = 'ALL';
  selectedAssignMember: EventMember | null = null;
  assignMemberFunction = '';
  assignMemberError = '';

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
  inviteError = '';
  inviteExpirationOption: '3' | '7' | '15' | '30' | 'custom' = '7';
  inviteCustomExpiresAt = '';
  inviteRole: 'ORGANIZER' | 'STAFF' | 'MEMBER' = 'MEMBER';

  showBulkInviteModal = false;
  bulkInviteFile: File | null = null;
  bulkInviteError = '';
  bulkInviteResult: { sent: any[], failed: any[] } | null = null;
  bulkInviteProcessing = false;
  bulkInviteExpirationOption: '3' | '7' | '15' | '30' | 'custom' = '7';
  bulkInviteCustomExpiresAt = '';

  showRemoveMemberModal = false;
  removeMemberId: number | null = null;
  removeMemberEmail = '';
  removeReason = '';

  showChangeRoleModal = false;
  changeRoleMemberId: number | null = null;
  changeRoleMemberEmail = '';
  newRole: EventRole = 'MEMBER';

  showCancelInviteModal = false;
  cancelInviteId: number | null = null;
  cancelInviteReason = '';

  showLeaveModal = false;
  leaveReason = '';

  showEditEventModal = false;
  editEventForm = { title: '', description: '', location: '', eventType: '', startDatetime: '', endDatetime: '' };
  editEventFormError = '';
  eventImages: EventImageResponse[] = [];
  eventImagesLoading = false;
  uploadingImage = false;
  imageUploadError = '';

  enrollingActivityId: number | null = null;
  enrollError = '';

  // ── QR & Asistencia ──────────────────────────────────────────────────────────
  showEventQrModal = false;
  eventQrImage = '';
  eventQrLoading = false;
  eventQrError = '';

  showScanModal = false;
  scanToken = '';
  scanResult: AttendanceResponse | null = null;
  scanError = '';
  scanProcessing = false;
  cameraActive = false;
  cameraError = false;
  private html5QrCode: Html5Qrcode | null = null;

  eventAttendance: AttendanceResponse[] = [];
  attendanceLoading = false;

  private currentUserEmail = localStorage.getItem('email') || '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private invitationService: InvitationService,
    private activityService: ActivityService,
    private attendanceService: AttendanceService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = true; this.loading = false; return; }
    this.loadAll(id);
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  loadAll(id: number): void {
    this.loading = true;
    this.error = false;
    let done = 0;
    const total = 4;
    const check = () => { done++; if (done === total) this.loading = false; };

    this.eventService.getEventById(id).subscribe({
      next: (res) => { if (res.success) { this.event = res.data; this.loadEventImagesReadonly(); } check(); },
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
    if (tab === 'activities' && this.event) {
      if (this.activities.length === 0) this.loadActivities();
    }
    if (tab === 'attendance' && this.event && this.eventAttendance.length === 0) {
      this.loadEventAttendance();
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

  get myEventRole(): EventRole | null {
    const m = this.members.find(x => x.userEmail === this.currentUserEmail && x.status === 'ACTIVE');
    return m ? m.eventRole : null;
  }

  get canLeave(): boolean {
    const m = this.members.find(x => x.userEmail === this.currentUserEmail && x.status === 'ACTIVE');
    return !!m && m.eventRole !== 'ORGANIZER';
  }

  get canEdit(): boolean {
    return this.isOrganizer && !!this.event &&
      this.event.status !== 'FINISHED' && this.event.status !== 'CANCELLED';
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get sortedAuditLog(): AuditLog[] {
    return [...this.auditLog].sort((a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }

  get inProgressCount(): number {
    return this.activities.filter(a => a.status === 'IN_PROGRESS').length;
  }

  get filteredActivities(): ActivityResponse[] {
    let result = this.activities;
    if (this.activityStatusFilter !== 'ALL') {
      result = result.filter(a => a.status === this.activityStatusFilter);
    }
    if (this.showOnlyMyActivities) {
      result = result.filter(a => this.myActivityAssignments.has(a.id));
    }
    if (this.activitySearchTerm.trim()) {
      const term = this.activitySearchTerm.trim().toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(term));
    }
    return result;
  }

  get filteredInvitations(): InvitationResponse[] {
    let result = this.invitations;
    if (this.invitationStatusFilter !== 'ALL') {
      result = result.filter(i => i.status === this.invitationStatusFilter);
    }
    if (this.invitationSearchTerm.trim()) {
      const term = this.invitationSearchTerm.trim().toLowerCase();
      result = result.filter(i =>
        i.invitedEmail.toLowerCase().includes(term) ||
        (i.eventTitle && i.eventTitle.toLowerCase().includes(term))
      );
    }
    return result;
  }

  get assignableEventMembers(): EventMember[] {
    let result = this.members.filter(m => m.status === 'ACTIVE' && m.eventRole !== 'ORGANIZER');
    if (this.assignMemberRoleFilter !== 'ALL') {
      result = result.filter(m => m.eventRole === this.assignMemberRoleFilter);
    }
    return result;
  }

  get availableActivityRoles(): ActivityMemberRole[] {
    if (!this.selectedAssignMember) return [];
    if (this.selectedAssignMember.eventRole === 'STAFF') return ['STAFF'];
    if (this.selectedAssignMember.eventRole === 'MEMBER') return ['PARTICIPANT', 'JUDGE'];
    return [];
  }

  getMembersByRole(role: EventRole): EventMember[] {
    return this.members.filter(m => m.eventRole === role && m.status === 'ACTIVE');
  }

  getRoleLabel(role: EventRole): string {
    const labels: Record<EventRole, string> = {
      ORGANIZER: 'Organizadores', STAFF: 'Personal de apoyo',
      JUDGE: 'Jueces', PARTICIPANT: 'Participantes', ATTENDEE: 'Asistentes', MEMBER: 'Miembros'
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

  getInviteStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente', ACCEPTED: 'Aceptada',
      DECLINED: 'Rechazada', CANCELLED: 'Cancelada', EXPIRED: 'Vencida'
    };
    return labels[status] || status;
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
    this.editEventForm = {
      title: this.event.title,
      description: this.event.description || '',
      location: this.event.location || '',
      eventType: this.event.eventType,
      startDatetime: this.event.startDatetime.replace(' ', 'T').substring(0, 16),
      endDatetime: this.event.endDatetime.replace(' ', 'T').substring(0, 16)
    };
    this.editEventFormError = '';
    this.loadEventImages();
    this.showEditEventModal = true;
  }

  submitEditEvent(): void {
    if (!this.event || !this.editEventForm.title.trim()) return;
    this.processing = true; this.editEventFormError = '';
    this.eventService.updateEvent(this.event.id, {
      title: this.editEventForm.title,
      description: this.editEventForm.description || undefined,
      location: this.editEventForm.location || undefined,
      eventType: this.editEventForm.eventType,
      startDatetime: this.editEventForm.startDatetime,
      endDatetime: this.editEventForm.endDatetime
    }).subscribe({
      next: (res) => { if (res.success) this.event = res.data; this.showEditEventModal = false; this.processing = false; },
      error: (err) => { this.editEventFormError = err.error?.message || 'Error al editar.'; this.processing = false; }
    });
  }

  loadEventImagesReadonly(): void {
    if (!this.event) return;
    this.eventService.getEventImages(this.event.id).subscribe({
      next: (res) => { if (res.success) this.eventImages = res.data; }
    });
  }

  loadEventImages(): void {
    if (!this.event) return;
    this.eventImagesLoading = true;
    this.eventService.getEventImages(this.event.id).subscribe({
      next: (res) => { if (res.success) this.eventImages = res.data; this.eventImagesLoading = false; },
      error: () => { this.eventImagesLoading = false; }
    });
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.event) return;
    const file = input.files[0];
    this.uploadingImage = true;
    this.imageUploadError = '';
    this.eventService.uploadEventImage(this.event.id, file).subscribe({
      next: (res) => {
        if (res.success) this.eventImages = [...this.eventImages, res.data];
        this.uploadingImage = false;
        input.value = '';
      },
      error: (err) => {
        this.imageUploadError = err.error?.message || 'Error al subir la imagen.';
        this.uploadingImage = false;
        input.value = '';
      }
    });
  }

  deleteEventImage(imageId: number): void {
    if (!this.event) return;
    this.eventService.deleteEventImage(this.event.id, imageId).subscribe({
      next: () => { this.eventImages = this.eventImages.filter(img => img.id !== imageId); },
      error: (err) => { this.imageUploadError = err.error?.message || 'Error al eliminar la imagen.'; }
    });
  }

  setCoverImage(imageId: number): void {
    if (!this.event) return;
    this.eventService.setCoverImage(this.event.id, imageId).subscribe({
      next: () => {
        this.eventImages = this.eventImages.map(img => ({ ...img, isCover: img.id === imageId }));
      },
      error: (err) => { this.imageUploadError = err.error?.message || 'Error al actualizar la portada.'; }
    });
  }

  // ── Members ──────────────────────────────────────────────────────────────────
  openInviteModal(): void {
    this.inviteEmail = ''; this.inviteError = '';
    this.inviteExpirationOption = '7';
    this.inviteCustomExpiresAt = '';
    this.inviteRole = 'MEMBER';
    this.showInviteModal = true;
    if (this.invitations.length === 0) this.loadInvitations();
  }

  private computeExpiresAt(option: '3' | '7' | '15' | '30' | 'custom', customDate: string): string | undefined {
  if (option === 'custom') {
    if (!customDate) return undefined;
    const [year, month, day] = customDate.split('-').map(Number);
    const date = new Date(year, month - 1, day + 1, 0, 0, 0);
    return date.toISOString();
  }
  const days = Number(option);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

  submitInvite(): void {
    if (!this.event || !this.inviteEmail.trim()) return;
    this.processing = true; this.inviteError = '';
    this.invitationService.sendInvitation(
      this.event.id,
      this.inviteEmail.trim(),
      this.computeExpiresAt(this.inviteExpirationOption, this.inviteCustomExpiresAt),
      this.inviteRole
    ).subscribe({
      next: () => {
        this.showInviteModal = false; this.processing = false;
        this.loadInvitations();
      },
      error: (err) => { this.inviteError = err.error?.message || 'Error al enviar invitación.'; this.processing = false; }
    });
  }

  openBulkInviteModal(): void {
    this.bulkInviteFile = null;
    this.bulkInviteError = '';
    this.bulkInviteResult = null;
    this.bulkInviteExpirationOption = '7';
    this.bulkInviteCustomExpiresAt = '';
    this.showBulkInviteModal = true;
  }

  onBulkFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.bulkInviteFile = input.files[0];
      this.bulkInviteError = '';
    }
  }

  submitBulkInvite(): void {
    if (!this.event || !this.bulkInviteFile) return;
    this.bulkInviteProcessing = true;
    this.bulkInviteError = '';
    this.invitationService.sendBulkInvitations(
      this.event.id,
      this.bulkInviteFile,
      this.computeExpiresAt(this.bulkInviteExpirationOption, this.bulkInviteCustomExpiresAt)
    ).subscribe({
      next: (res) => {
        this.bulkInviteResult = res.data;
        this.bulkInviteProcessing = false;
        this.loadInvitations();
      },
      error: (err) => {
        this.bulkInviteError = err.error?.message || 'Error al procesar el archivo.';
        this.bulkInviteProcessing = false;
      }
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
    this.myStaffAssignedActivities = new Set();
    this.activities.forEach(activity => {
      this.activityService.getMyAssignment(activity.id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.myActivityAssignments.add(activity.id);
            if (res.data.eventRole === 'STAFF') {
              this.myStaffAssignedActivities.add(activity.id);
            }
          }
        },
        error: () => {}
      });
    });
  }

  canEnroll(activity: ActivityResponse): boolean {
    if (this.myEventRole !== 'MEMBER') return false;
    if (!activity.enrollmentEnabled) return false;
    if (activity.status !== 'PENDING') return false;
    if (this.myActivityAssignments.has(activity.id)) return false;
    if (activity.maxEnrollment && activity.currentEnrollments >= activity.maxEnrollment) return false;
    return true;
  }

  enrollInActivity(activityId: number): void {
    this.enrollingActivityId = activityId;
    this.enrollError = '';
    this.activityService.enroll(activityId).subscribe({
      next: () => {
        this.myActivityAssignments.add(activityId);
        this.activities = this.activities.map(a =>
          a.id === activityId ? { ...a, currentEnrollments: a.currentEnrollments + 1 } : a
        );
        this.enrollingActivityId = null;
      },
      error: (err) => {
        this.enrollError = err.error?.message || 'Error al inscribirte.';
        this.enrollingActivityId = null;
      }
    });
  }

  openCreateActivity(): void {
    this.editingActivityId = null;
    this.activityForm = { title: '', description: '', location: '',
      startDatetime: '', endDatetime: '', enrollmentEnabled: false, maxEnrollment: null };
    this.activityFormError = '';
    this.newActivityPendingFiles = [];
    this.showCreateActivityModal = true;
  }

  onNewActivityFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.newActivityPendingFiles = [...this.newActivityPendingFiles, ...Array.from(input.files)];
    input.value = '';
  }

  removePendingActivityFile(index: number): void {
    this.newActivityPendingFiles = this.newActivityPendingFiles.filter((_, i) => i !== index);
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
    this.activityImages = [];
    this.activityImagesLoading = true;
    this.activityImageUploadError = '';
    this.activityService.getActivityImages(activity.id).subscribe({
      next: (res) => { if (res.success) this.activityImages = res.data; this.activityImagesLoading = false; },
      error: () => { this.activityImagesLoading = false; }
    });
    this.showEditActivityModal = true;
  }

  onActivityImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.editingActivityId) return;
    const file = input.files[0];
    this.uploadingActivityImage = true;
    this.activityImageUploadError = '';
    this.activityService.uploadActivityImage(this.editingActivityId, file).subscribe({
      next: (res) => {
        if (res.success) this.activityImages = [...this.activityImages, res.data];
        this.uploadingActivityImage = false;
        input.value = '';
      },
      error: (err) => {
        this.activityImageUploadError = err.error?.message || 'Error al subir la imagen.';
        this.uploadingActivityImage = false;
        input.value = '';
      }
    });
  }

  deleteActivityImageFile(imageId: number): void {
    if (!this.editingActivityId) return;
    this.activityService.deleteActivityImage(this.editingActivityId, imageId).subscribe({
      next: () => { this.activityImages = this.activityImages.filter(img => img.id !== imageId); },
      error: (err) => { this.activityImageUploadError = err.error?.message || 'Error al eliminar la imagen.'; }
    });
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
          const files = [...this.newActivityPendingFiles];
          if (files.length > 0) {
            const activityId = res.data.id;
            let remaining = files.length;
            let failedCount = 0;
            const onDone = () => {
              remaining--;
              if (remaining === 0) {
                if (failedCount > 0) this.activityFormError = 'Actividad creada. Algunas imágenes no se pudieron subir.';
                this.newActivityPendingFiles = [];
                this.showCreateActivityModal = false;
                this.processing = false;
              }
            };
            files.forEach(file => {
              this.activityService.uploadActivityImage(activityId, file).subscribe({
                next: () => onDone(),
                error: () => { failedCount++; onDone(); }
              });
            });
          } else {
            this.newActivityPendingFiles = [];
            this.showCreateActivityModal = false;
            this.processing = false;
          }
        } else {
          this.processing = false;
        }
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
    this.selectedAssignMember = null;
    this.assignMemberRoleFilter = 'ALL';
    this.assignMemberRole = 'PARTICIPANT';
    this.assignMemberFunction = '';
    this.assignMemberError = '';
    this.showAssignMemberModal = true;
  }

  selectAssignMember(member: EventMember): void {
    this.selectedAssignMember = member;
    if (member.eventRole === 'STAFF') {
      this.assignMemberRole = 'STAFF';
    } else if (member.eventRole === 'MEMBER') {
      this.assignMemberRole = 'PARTICIPANT';
    }
  }

  submitAssignMember(): void {
    if (!this.assignActivityId || !this.selectedAssignMember) return;
    this.processing = true; this.assignMemberError = '';
    this.activityService.assignMember(this.assignActivityId, {
      userEmail: this.selectedAssignMember.userEmail,
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
    this.router.navigate(['/dashboard-user/activities', activity.id]);
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

  // ── QR & Asistencia ──────────────────────────────────────────────────────────

  get canShowEventQr(): boolean {
    return this.myEventRole === 'MEMBER' && !!this.event && this.event.status === 'IN_PROGRESS';
  }

  get canScanEventAttendance(): boolean {
    return this.myEventRole === 'ORGANIZER' || this.myEventRole === 'STAFF';
  }

  openEventQrModal(): void {
    if (!this.event) return;
    this.eventQrImage = '';
    this.eventQrLoading = true;
    this.eventQrError = '';
    this.showEventQrModal = true;
    this.attendanceService.getEventQr(this.event.id).subscribe({
      next: (res) => {
        if (res.success) this.eventQrImage = res.data.qrImage;
        this.eventQrLoading = false;
      },
      error: (err) => {
        this.eventQrError = err.error?.message || 'No se pudo generar el QR.';
        this.eventQrLoading = false;
      }
    });
  }

  openScanModal(): void {
    this.scanToken = '';
    this.scanResult = null;
    this.scanError = '';
    this.cameraActive = false;
    this.cameraError = false;
    this.scanProcessing = false;
    this.showScanModal = true;
    setTimeout(() => this.startCamera(), 250);
  }

  closeScanModal(): void {
    this.stopCamera();
    this.showScanModal = false;
  }

  private startCamera(): void {
    if (!this.showScanModal) return;
    const el = document.getElementById('qr-reader');
    if (!el) return;
    this.html5QrCode = new Html5Qrcode('qr-reader');
    this.html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string) => {
        this.zone.run(() => {
          if (this.scanProcessing || this.scanResult) return;
          this.stopCamera();
          this.processEventScan(decodedText);
        });
      },
      (_err: string) => {}
    ).then(() => {
      this.zone.run(() => { this.cameraActive = true; });
    }).catch(() => {
      this.zone.run(() => { this.cameraError = true; this.html5QrCode = null; });
    });
  }

  private stopCamera(): void {
    if (!this.html5QrCode) return;
    const scanner = this.html5QrCode;
    this.html5QrCode = null;
    this.cameraActive = false;
    scanner.stop().then(() => scanner.clear()).catch(() => {});
  }

  resetScan(): void {
    this.scanResult = null;
    this.scanError = '';
    this.scanToken = '';
    this.cameraError = false;
    this.cameraActive = false;
    setTimeout(() => this.startCamera(), 250);
  }

  submitScanManual(): void {
    if (!this.scanToken.trim() || this.scanProcessing) return;
    this.stopCamera();
    this.processEventScan(this.scanToken.trim());
  }

  private processEventScan(token: string): void {
    this.scanProcessing = true;
    this.scanError = '';
    this.scanResult = null;
    this.attendanceService.scan(token).subscribe({
      next: (res) => {
        if (res.success) {
          this.scanResult = res.data;
          this.loadEventAttendance();
        }
        this.scanProcessing = false;
      },
      error: (err) => {
        this.scanError = err.error?.message || 'Error al registrar la asistencia.';
        this.scanProcessing = false;
      }
    });
  }

  loadEventAttendance(): void {
    if (!this.event) return;
    this.attendanceLoading = true;
    this.attendanceService.getEventAttendance(this.event.id).subscribe({
      next: (res) => {
        if (res.success) this.eventAttendance = res.data;
        this.attendanceLoading = false;
      },
      error: () => { this.attendanceLoading = false; }
    });
  }
  get currentUserRole(): string {
  const m = this.members.find(x => x.userEmail === this.currentUserEmail && x.status === 'ACTIVE');
  return m?.eventRole || '';
}
}