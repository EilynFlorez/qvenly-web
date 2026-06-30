# CHATBOT_CONTEXTO — Qvenly Web

Archivos clave del proyecto Angular para contexto de chatbot/IA.
Rutas relativas a `qvenly-web/`.

---

## core/core-dashboard/services/dashboard.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventByOrganizerResponse, EventUserDetail, GeneralStats, MonthlyGrowthResponse, PlanStatsResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `http://localhost:9000/admin/dashboard`;

  constructor(private http: HttpClient) { }

  getGeneralStats(): Observable<GeneralStats>{
    return this.http.get<GeneralStats>(`${this.apiUrl}/stats`);
  }

  getOrganizersByPlan(startDate?: string, endDate?: string, plan?: string): Observable<PlanStatsResponse> {
  let url = `${this.apiUrl}/plans`;
  const params: string[] = [];

  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (plan) params.push(`plan=${plan}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get<PlanStatsResponse>(url);
}

  getEventsByOrganizer(startDate?: string, endDate?: string, plan?: string): Observable<EventByOrganizerResponse> {
  let url = `${this.apiUrl}/organizers`;
  const params: string[] = [];

  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (plan) params.push(`plan=${plan}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get<EventByOrganizerResponse>(url);
}

  getUserByEvent(): Observable<EventUserDetail[]>{
    return this.http.get<EventUserDetail[]>(`${this.apiUrl}/events/usersByRole`);
  }

  getMonthlyGrowth(startDate?: string, endDate?: string, plan?: string): Observable<MonthlyGrowthResponse> {
  let url = `${this.apiUrl}/growth`;
  const params: string[] = [];

  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (plan) params.push(`plan=${plan}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get<MonthlyGrowthResponse>(url);
}
}
```

---

## core/core-events/services/event.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ApiResponse, EventResponse, CreateEventRequest, UpdateEventRequest,
  EventMember, LimitsUsage, AuditLog, EventRole, EventImageResponse
} from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  getMyEvents(): Observable<ApiResponse<EventResponse[]>> {
    return this.http.get<ApiResponse<EventResponse[]>>(this.apiUrl, { withCredentials: true });
  }

  getEventById(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.get<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createEvent(data: CreateEventRequest): Observable<ApiResponse<EventResponse>> {
    return this.http.post<ApiResponse<EventResponse>>(this.apiUrl, data, { withCredentials: true });
  }

  updateEvent(id: number, data: UpdateEventRequest): Observable<ApiResponse<EventResponse>> {
    return this.http.put<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  publishEvent(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/publish`, {}, { withCredentials: true });
  }

  startEvent(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/start`, {}, { withCredentials: true });
  }

  finishEvent(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/finish`, {}, { withCredentials: true });
  }

  cancelEvent(id: number, cancelReason: string): Observable<ApiResponse<EventResponse>> {
    return this.http.patch<ApiResponse<EventResponse>>(`${this.apiUrl}/${id}/cancel`, { cancelReason }, { withCredentials: true });
  }

  getMembers(id: number): Observable<ApiResponse<EventMember[]>> {
    return this.http.get<ApiResponse<EventMember[]>>(`${this.apiUrl}/${id}/members`, { withCredentials: true });
  }

  getLimits(id: number): Observable<ApiResponse<LimitsUsage>> {
    return this.http.get<ApiResponse<LimitsUsage>>(`${this.apiUrl}/${id}/limits`, { withCredentials: true });
  }

  getAuditLog(id: number): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.apiUrl}/${id}/audit`, { withCredentials: true });
  }

  removeMember(eventId: number, memberId: number, reason: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${eventId}/members/${memberId}`, {
      body: { reason },
      withCredentials: true
    });
  }

  changeMemberRole(eventId: number, memberId: number, newRole: EventRole): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${eventId}/members/${memberId}/role`, { newRole }, { withCredentials: true });
  }

  leaveEvent(eventId: number, reason: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${eventId}/leave`, { reason }, { withCredentials: true });
  }

  uploadEventImage(eventId: number, file: File): Observable<ApiResponse<EventImageResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<EventImageResponse>>(
      `${this.apiUrl}/${eventId}/images`, formData, { withCredentials: true }
    );
  }

  getEventImages(eventId: number): Observable<ApiResponse<EventImageResponse[]>> {
    return this.http.get<ApiResponse<EventImageResponse[]>>(
      `${this.apiUrl}/${eventId}/images`, { withCredentials: true }
    );
  }

  deleteEventImage(eventId: number, imageId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${eventId}/images/${imageId}`, { withCredentials: true }
    );
  }

  setCoverImage(eventId: number, imageId: number): Observable<ApiResponse<EventImageResponse>> {
    return this.http.patch<ApiResponse<EventImageResponse>>(
      `${this.apiUrl}/${eventId}/images/${imageId}/cover`, {}, { withCredentials: true }
    );
  }
}
```

---

## core/core-activities/services/activity.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../../core-events/models/event.model';
import {
  ActivityResponse, CreateActivityRequest, UpdateActivityRequest,
  ActivityMember, AssignMemberRequest, ActivityEnrollment,
  QrCodeResponse, AuditLogActivity,
  AgendaItem,
  ActivityStatus,
  ActivityImageResponse
} from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/api/activities`;
  private qrUrl = `${environment.apiUrl}/api/qr`;

  constructor(private http: HttpClient) { }

  // ── Actividades ────────────────────────────────────────────────────────────

  getActivitiesByEvent(
    eventId: number,
    filters?: { name?: string; date?: string; status?: ActivityStatus }
  ): Observable<ApiResponse<ActivityResponse[]>> {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<ApiResponse<ActivityResponse[]>>(
      `${this.apiUrl}/event/${eventId}`, { params, withCredentials: true }
    );
  }

  getActivityById(id: number): Observable<ApiResponse<ActivityResponse>> {
    return this.http.get<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}`, { withCredentials: true }
    );
  }

  createActivity(data: CreateActivityRequest): Observable<ApiResponse<ActivityResponse>> {
    return this.http.post<ApiResponse<ActivityResponse>>(
      this.apiUrl, data, { withCredentials: true }
    );
  }

  updateActivity(id: number, data: UpdateActivityRequest): Observable<ApiResponse<ActivityResponse>> {
    return this.http.put<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}`, data, { withCredentials: true }
    );
  }

  startActivity(id: number): Observable<ApiResponse<ActivityResponse>> {
    return this.http.patch<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}/start`, {}, { withCredentials: true }
    );
  }

  finishActivity(id: number): Observable<ApiResponse<ActivityResponse>> {
    return this.http.patch<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}/finish`, {}, { withCredentials: true }
    );
  }

  cancelActivity(id: number, cancelReason: string): Observable<ApiResponse<ActivityResponse>> {
    return this.http.patch<ApiResponse<ActivityResponse>>(
      `${this.apiUrl}/${id}/cancel`, { cancelReason }, { withCredentials: true }
    );
  }

  getAuditLog(id: number): Observable<ApiResponse<AuditLogActivity[]>> {
    return this.http.get<ApiResponse<AuditLogActivity[]>>(
      `${this.apiUrl}/${id}/audit`, { withCredentials: true }
    );
  }

  // ── Miembros ───────────────────────────────────────────────────────────────

  getMembersByActivity(activityId: number): Observable<ApiResponse<ActivityMember[]>> {
    return this.http.get<ApiResponse<ActivityMember[]>>(
      `${this.apiUrl}/${activityId}/members`, { withCredentials: true }
    );
  }

  getMyAssignment(activityId: number): Observable<ApiResponse<ActivityMember | null>> {
    return this.http.get<ApiResponse<ActivityMember | null>>(
      `${this.apiUrl}/${activityId}/members/me`, { withCredentials: true }
    );
  }

  assignMember(activityId: number, data: AssignMemberRequest): Observable<ApiResponse<ActivityMember>> {
    return this.http.post<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members`, data, { withCredentials: true }
    );
  }

  removeMember(activityId: number, memberId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${activityId}/members/${memberId}`, { withCredentials: true }
    );
  }

  confirmParticipation(activityId: number): Observable<ApiResponse<ActivityMember>> {
    return this.http.patch<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members/confirm`, {}, { withCredentials: true }
    );
  }

  cancelParticipation(activityId: number, cancelReason: string): Observable<ApiResponse<ActivityMember>> {
    return this.http.patch<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members/cancel`, { cancelReason }, { withCredentials: true }
    );
  }

  // ── Inscripciones ──────────────────────────────────────────────────────────

  getEnrollments(activityId: number): Observable<ApiResponse<ActivityMember[]>> {
    return this.http.get<ApiResponse<ActivityMember[]>>(
      `${this.apiUrl}/${activityId}/members?role=ATTENDEE`, { withCredentials: true }
    );
  }

  enroll(activityId: number): Observable<ApiResponse<ActivityMember>> {
    return this.http.post<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/enroll`, {}, { withCredentials: true }
    );
  }

  cancelEnrollment(activityId: number, cancelReason: string): Observable<ApiResponse<ActivityMember>> {
    return this.http.patch<ApiResponse<ActivityMember>>(
      `${this.apiUrl}/${activityId}/members/cancel`, { cancelReason }, { withCredentials: true }
    );
  }

  // ── QR ────────────────────────────────────────────────────────────────────

  generateEventQr(eventId: number, eventStartDatetime: string): Observable<ApiResponse<QrCodeResponse>> {
    return this.http.post<ApiResponse<QrCodeResponse>>(
      `${this.qrUrl}/event/${eventId}/generate?eventStartDatetime=${encodeURIComponent(eventStartDatetime)}`,
      {}, { withCredentials: true }
    );
  }

  generateActivityQr(activityId: number): Observable<ApiResponse<QrCodeResponse>> {
    return this.http.post<ApiResponse<QrCodeResponse>>(
      `${this.qrUrl}/activity/${activityId}/generate`,
      {}, { withCredentials: true }
    );
  }

  getMyAgenda(
    filters?: { name?: string; eventId?: number; date?: string; status?: ActivityStatus }
  ): Observable<ApiResponse<AgendaItem[]>> {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.eventId) params = params.set('eventId', filters.eventId.toString());
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<ApiResponse<AgendaItem[]>>(
      `${this.apiUrl}/my-agenda`, { params, withCredentials: true }
    );
  }

  getActivityImages(activityId: number): Observable<ApiResponse<ActivityImageResponse[]>> {
    return this.http.get<ApiResponse<ActivityImageResponse[]>>(
      `${this.apiUrl}/${activityId}/images`, { withCredentials: true }
    );
  }

  uploadActivityImage(activityId: number, file: File): Observable<ApiResponse<ActivityImageResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<ActivityImageResponse>>(
      `${this.apiUrl}/${activityId}/images`, formData, { withCredentials: true }
    );
  }

  deleteActivityImage(activityId: number, imageId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${activityId}/images/${imageId}`, { withCredentials: true }
    );
  }
}
```

---

## features/dashboard-user/dashboard-user.module.ts

```typescript
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarDateFormatter, CalendarModule, CalendarNativeDateFormatter, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { DashboardUserRoutingModule } from './dashboard-user-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { MiPlanComponent } from './pages/mi-plan/mi-plan.component';
import { MyEventsComponent } from './pages/my-events/my-events.component';
import { EventCreateComponent } from './pages/event-create/event-create.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { InvitationsComponent } from './pages/invitations/invitations.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { EventHistoryComponent } from './pages/event-history/event-history.component';
import { ActivityDetailComponent } from './pages/activity-detail/activity-detail.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);
import { EventSurveysComponent } from './pages/event-surveys/event-surveys.component';
import { SurveyResultsComponent } from './pages/survey-results/survey-results.component';
import { UserSurveysComponent } from './pages/user-surveys/user-surveys.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    DashboardUserComponent,
    MiPlanComponent,
    MyEventsComponent,
    EventCreateComponent,
    EventDetailComponent,
    InvitationsComponent,
    PaymentResultComponent,
    PlanesComponent,
    EventHistoryComponent,
    ActivityDetailComponent,
    EventSurveysComponent,
    SurveyResultsComponent,
    UserSurveysComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    DashboardUserRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: CalendarDateFormatter, useClass: CalendarNativeDateFormatter }
  ]
})
export class DashboardUserModule { }
```

---

## features/dashboard-user/dashboard-layout.component.ts

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/core-auth/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {

  userName = '';
  userEmail = '';
  userInitials = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName     = this.authService.getUserName() || '';
    this.userEmail    = localStorage.getItem('email') || '';
    this.userInitials = this.userName
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => { this.authService.clearSession(); this.router.navigate(['/auth/login']); },
      error: () => { this.authService.clearSession(); this.router.navigate(['/auth/login']); }
    });
  }
}
```

---

## features/dashboard-user/dashboard-layout.component.html

```html
<div class="layout">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <img src="assets/images/logoQvn.png" alt="Qvenly">
      </div>
      <span class="logo-name">Qvenly</span>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-group">Principal</p>
      <a class="nav-item" routerLink="/dashboard-user" routerLinkActive="active"
        [routerLinkActiveOptions]="{exact: true}">
        <i class="ti ti-layout-dashboard"></i> Dashboard
      </a>

      <p class="nav-group">Mi Plan</p>
      <a class="nav-item" routerLink="/dashboard-user/plan" routerLinkActive="active">
        <i class="ti ti-diamond"></i> Mi plan activo
      </a>
      <a class="nav-item" routerLink="/dashboard-user/planes" routerLinkActive="active">
        <i class="ti ti-layout-grid-add"></i> Ver planes
      </a>

      <p class="nav-group">Mis Actividades</p>
      <a class="nav-item" routerLink="/dashboard-user/events" routerLinkActive="active">
        <i class="ti ti-calendar-event"></i> Mis eventos
      </a>
      <a class="nav-item" routerLink="/dashboard-user/invitations" routerLinkActive="active">
        <i class="ti ti-mail"></i> Invitaciones
      </a>
      <a class="nav-item" routerLink="/dashboard-user/surveys" routerLinkActive="active">
        <i class="ti ti-clipboard-list"></i> Encuestas
      </a>
      <a class="nav-item" routerLink="/dashboard-user/history" routerLinkActive="active">
        <i class="ti ti-history"></i> Historial
      </a>

      <p class="nav-group">Cuenta</p>
      <a class="nav-item" routerLink="/dashboard-user/profile" routerLinkActive="active">
        <i class="ti ti-user-circle"></i> Mi perfil
      </a>
      <a class="nav-item nav-item--danger" (click)="onLogout()">
        <i class="ti ti-logout"></i> Cerrar sesión
      </a>
    </nav>

    <div class="sidebar-user">
      <div class="user-profile">{{ userInitials }}</div>
      <div class="user-info">
        <p class="user-name">{{ userName }}</p>
        <p class="user-email">{{ userEmail }}</p>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main>
    <div class="main-content">

      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">
            Bienvenido, <span class="topbar-title--accent">{{ userName }}</span>
          </h1>
          <p class="topbar-sub">Gestiona tu plan y tus eventos desde aquí</p>
        </div>

        <div class="topbar-right">
          <app-notification-bell></app-notification-bell>
          <div class="topbar-avatar" routerLink="/dashboard-user/profile">
            {{ userInitials }}
          </div>
        </div>
      </div>

      <!-- Contenido de la página hija -->
      <div class="page-body">
        <router-outlet></router-outlet>
      </div>

    </div>
  </main>

</div>
```

---

## features/dashboard-user/styles/_dashboard-variables.scss

```scss
// ─── Design tokens del módulo dashboard-user ─────────────────────────────────
$teal:        #00B8A9;
$teal-dark:   #008A7D;
$teal-light:  rgba(0, 184, 169, 0.08);
$teal-border: rgba(0, 184, 169, 0.12);

$gray-900:    #1A2332;
$gray-500:    #6B7280;
$gray-400:    #9ca3af;
$gray-200:    #E5E7EB;
$gray-100:    #F3F4F6;
$white:       #ffffff;

$red:         #ef4444;
$red-bg:      rgba(239, 68, 68, 0.06);

$purple:      #8b5cf6;
$purple-bg:   rgba(139, 92, 246, 0.08);
$orange:      #f97316;
$orange-bg:   rgba(249, 115, 22, 0.08);
$blue:        #3b82f6;
$blue-bg:     rgba(59, 130, 246, 0.08);
$green:       #10b981;
$green-bg:    rgba(16, 185, 129, 0.08);

$font:        'DM Sans', sans-serif;

// ─── Typography scale (max 5 sizes) ──────────────────────────────────────────
$fs-display: 22px;  // KPI values, large numeric displays, prices
$fs-title:   20px;  // Page-level headings (topbar-title, logo-name)
$fs-section: 15px;  // Section/card headings
$fs-body:    13px;  // Body text, descriptions
$fs-meta:    11px;  // Labels, badges, timestamps

// ─── Radii ───────────────────────────────────────────────────────────────────
$radius-lg:   16px; // Full plan cards, large modals
$radius-md:   14px; // KPI cards, section cards
$radius-sm:   10px; // Buttons, badges, small elements
$radius-pill: 99px; // Pill badges

// ─── Shadows ─────────────────────────────────────────────────────────────────
$shadow-card:       0 4px 16px rgba(0, 184, 169, 0.08);
$shadow-card-hover: 0 8px 24px rgba(0, 184, 169, 0.12);
```

---

## core/core-events/models/event.model.ts

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
export type EventRole = 'ORGANIZER' | 'STAFF' | 'JUDGE' | 'PARTICIPANT' | 'ATTENDEE' | 'MEMBER';

export interface PlanLimits {
  planName: string;
  maxEvents: number;
  maxOrganizers: number;
  maxGuests: number;
  maxStaff: number;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
  status: EventStatus;
  cancelReason: string | null;
  ownerUserId: number;
  ownerEmail: string;
  planLimits: PlanLimits;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  eventType?: string;
  startDatetime?: string;
  endDatetime?: string;
}

export interface EventMember {
  id: number;
  eventId: number;
  userId: number;
  userEmail: string;
  eventRole: EventRole;
  status: 'ACTIVE' | 'LEFT' | 'REMOVED';
  leaveReason: string | null;
  joinedAt: string;
  leftAt: string | null;
}

export interface RoleUsage {
  current: number;
  max: number;
  remaining: number;
  full: boolean;
}

export interface LimitsUsage {
  planName: string;
  organizers: RoleUsage;
  staff: RoleUsage;
  members: RoleUsage;
}

export interface InvitationResponse {
  id: number;
  eventId: number;
  invitedByEmail: string;
  invitedEmail: string;
  eventRole: EventRole;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  cancelReason: string | null;
  token: string;
  sentAt: string;
  expiresAt: string;
  respondedAt: string | null;
  eventTitle: string;
  eventDescription: string | null;
  eventLocation: string | null;
  eventType: string;
  eventStartDatetime: string;
  eventEndDatetime: string;
  eventCoverImageUrl: string | null;
}

export interface AuditLog {
  id: number;
  eventId: number;
  actionType: string;
  performedByEmail: string;
  performedByRole: string;
  changeDetail: string;
  performedAt: string;
}

export interface EventImageResponse {
  id: number;
  eventId: number;
  imageUrl: string;
  isCover: boolean;
  uploadedAt: string;
}
```

---

## core/core-activities/models/activity.model.ts

```typescript
export type ActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export type ActivityMemberRole = 'STAFF' | 'PARTICIPANT' | 'ATTENDEE';

export type ConfirmationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface ActivityResponse {
  id: number;
  eventId: number;
  title: string;
  description: string;
  location: string;
  startDatetime: string;
  endDatetime: string;
  status: ActivityStatus;
  cancelReason: string | null;
  enrollmentEnabled: boolean;
  maxEnrollment: number | null;
  currentEnrollments: number;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  eventId: number;
  title: string;
  description?: string;
  location?: string;
  startDatetime: string;
  endDatetime: string;
  enrollmentEnabled?: boolean;
  maxEnrollment?: number;
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  location?: string;
  startDatetime?: string;
  endDatetime?: string;
  enrollmentEnabled?: boolean;
  maxEnrollment?: number;
}

export interface ActivityMember {
  id: number;
  activityId: number;
  eventId: number;
  userEmail: string;
  eventRole: ActivityMemberRole;
  functionDescription: string | null;
  status: 'ACTIVE' | 'CANCELLED';
  confirmationStatus: ConfirmationStatus;
  cancelReason: string | null;
  assignedAt: string;
  respondedAt: string | null;
}

export interface AssignMemberRequest {
  userEmail: string;
  eventRole: ActivityMemberRole;
  functionDescription?: string;
}

export interface ActivityEnrollment {
  id: number;
  activityId: number;
  eventId: number;
  userEmail: string;
  status: 'ENROLLED' | 'CANCELLED';
  enrolledAt: string;
  cancelledAt: string | null;
}

export interface QrCodeResponse {
  id: number;
  eventId: number;
  activityId: number | null;
  userEmail: string;
  qrType: 'EVENT_ACCESS' | 'ACTIVITY_ACCESS';
  token: string;
  used: boolean;
  validFrom: string;
  expiresAt: string | null;
  generatedAt: string;
  qrImageBase64: string | null;
}

export interface AttendanceRecord {
  id: number;
  eventId: number;
  activityId: number | null;
  userEmail: string;
  scannedByEmail: string;
  scannedAt: string;
}

export interface AuditLogActivity {
  id: number;
  activityId: number;
  eventId: number;
  actionType: string;
  performedByEmail: string;
  performedByRole: string;
  changeDetail: string;
  performedAt: string;
}

export interface AgendaItem {
  activityId: number;
  activityTitle: string;
  startDatetime: string;
  endDatetime: string;
  activityStatus: ActivityStatus;
  eventId: number;
  eventTitle: string;
  role: ActivityMemberRole;
  confirmationStatus: ConfirmationStatus;
}

export interface ActivityImageResponse {
  id: number;
  activityId: number;
  imageUrl: string;
  uploadedAt: string;
}
```
