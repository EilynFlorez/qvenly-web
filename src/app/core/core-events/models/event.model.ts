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
  maxParticipants: number;
  maxJudges: number;
  maxAttendees: number;
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
  participants: RoleUsage;
  judges: RoleUsage;
  attendees: RoleUsage;
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
