import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../../../core/core-activities/services/activity.service';
import { EventService } from '../../../../core/core-events/services/event.service';
import { EventMember } from '../../../../core/core-events/models/event.model';
import {
  ActivityResponse, ActivityMember, ActivityStatus,
  ActivityImageResponse, AuditLogActivity
} from '../../../../core/core-activities/models/activity.model';
import { AttendanceService } from '../../../../core/core-attendance/service/attendance.service';
import { AttendanceResponse } from '../../../../core/core-attendance/models/attendance.model';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit, OnDestroy {
  activity: ActivityResponse | null = null;
  activityMembers: ActivityMember[] = [];
  activityImages: ActivityImageResponse[] = [];
  auditLog: AuditLogActivity[] = [];
  auditLoading = false;
  isOrganizer = false;
  myAssignment: ActivityMember | null = null;
  myAssignmentLoading = false;
  private currentUserEmail = localStorage.getItem('email') || '';

  loading = true;
  error = false;
  membersLoading = false;
  imagesLoading = false;

  memberRoleFilter: 'ALL' | 'STAFF' | 'JUDGE' | 'PARTICIPANT' | 'ATTENDEE' = 'ALL';
  memberSearchTerm = '';

  // ── QR & Asistencia ──────────────────────────────────────────────────────────
  showActivityQrModal = false;
  actQrImage = '';
  actQrLoading = false;
  actQrError = '';

  showScanModal = false;
  scanToken = '';
  scanResult: AttendanceResponse | null = null;
  scanError = '';
  scanProcessing = false;
  cameraActive = false;
  cameraError = false;
  private html5QrCode: Html5Qrcode | null = null;

  activityAttendance: AttendanceResponse[] = [];
  actAttendanceLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private eventService: EventService,
    private attendanceService: AttendanceService,
    private zone: NgZone
  ) {}

  ngOnDestroy(): void {
    this.stopCamera();
  }

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
          this.loadImages(id);
          this.checkIfOrganizer(this.activity.eventId);
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

  private checkIfOrganizer(eventId: number): void {
    this.eventService.getMembers(eventId).subscribe({
      next: (res) => {
        if (res.success) {
          this.isOrganizer = res.data.some((m: EventMember) =>
            m.userEmail === this.currentUserEmail && m.eventRole === 'ORGANIZER' && m.status === 'ACTIVE'
          );
        }
        if (this.isOrganizer) {
          this.loadMembers(this.activity!.id);
          this.loadAuditLog(this.activity!.id);
          this.loadActivityAttendance();
        } else {
          this.loadMyAssignment(this.activity!.id);
        }
      },
      error: () => {
        this.loadMyAssignment(this.activity!.id);
      }
    });
  }

  private loadMyAssignment(id: number): void {
    this.myAssignmentLoading = true;
    this.activityService.getMembersByActivity(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.myAssignment = res.data.find(
            m => m.userEmail === this.currentUserEmail && m.status === 'ACTIVE'
          ) ?? null;
          if (this.myAssignment?.eventRole === 'STAFF') {
            this.loadActivityAttendance();
          }
        }
        this.myAssignmentLoading = false;
      },
      error: () => { this.myAssignmentLoading = false; }
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

  // ── QR & Asistencia ──────────────────────────────────────────────────────────

  get canShowActivityQr(): boolean {
    return !this.isOrganizer &&
      this.myAssignment != null &&
      this.myAssignment.eventRole !== 'STAFF' &&
      !!this.activity &&
      this.activity.status === 'IN_PROGRESS' &&
      this.activity.enrollmentEnabled;
  }

  get canScanActivityAttendance(): boolean {
    return this.isOrganizer || this.myAssignment?.eventRole === 'STAFF';
  }

  openActivityQrModal(): void {
    if (!this.activity) return;
    this.actQrImage = '';
    this.actQrLoading = true;
    this.actQrError = '';
    this.showActivityQrModal = true;
    this.attendanceService.getActivityQr(this.activity.id).subscribe({
      next: (res) => {
        if (res.success) this.actQrImage = res.data.qrImage;
        this.actQrLoading = false;
      },
      error: (err) => {
        this.actQrError = err.error?.message || 'No se pudo generar el QR.';
        this.actQrLoading = false;
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
    const el = document.getElementById('act-qr-reader');
    if (!el) return;
    this.html5QrCode = new Html5Qrcode('act-qr-reader');
    this.html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string) => {
        this.zone.run(() => {
          if (this.scanProcessing || this.scanResult) return;
          this.stopCamera();
          this.processActivityScan(decodedText);
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
    this.processActivityScan(this.scanToken.trim());
  }

  private processActivityScan(token: string): void {
    this.scanProcessing = true;
    this.scanError = '';
    this.scanResult = null;
    this.attendanceService.scan(token).subscribe({
      next: (res) => {
        if (res.success) {
          this.scanResult = res.data;
          this.loadActivityAttendance();
        }
        this.scanProcessing = false;
      },
      error: (err) => {
        this.scanError = err.error?.message || 'Error al registrar la asistencia.';
        this.scanProcessing = false;
      }
    });
  }

  loadActivityAttendance(): void {
    if (!this.activity) return;
    this.actAttendanceLoading = true;
    this.attendanceService.getActivityAttendance(this.activity.id).subscribe({
      next: (res) => {
        if (res.success) this.activityAttendance = res.data;
        this.actAttendanceLoading = false;
      },
      error: () => { this.actAttendanceLoading = false; }
    });
  }
}
