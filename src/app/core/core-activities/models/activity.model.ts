export type ActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export type ActivityMemberRole = 'STAFF' | 'JUDGE' | 'PARTICIPANT';

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
