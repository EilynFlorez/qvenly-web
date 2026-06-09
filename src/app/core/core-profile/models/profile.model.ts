export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roles: string[];
  documentType: string;
  documentNumber: string;
  memberSince: string;
  lastAccess: string;
  createdAt?: string;
}

export interface BackendUserProfile {
  id: number;
  name: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roles?: string[];
  documentType?: string;
  documentNumber?: string;
  createdAt?: string;
  lastAccess?: string;
}

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
  phoneNumber: string;
}

export interface BackendUpdateProfileRequest extends UpdateProfileRequest {
  email: string;
  documentType: string;
  documentNumber: string;
}

export interface NotificationPreferences {
  systemNotifications: boolean;
  accountNotifications: boolean;
  planNotifications: boolean;
  silentMode: boolean;
}

export interface NotificationSettingsResponse {
  userId: number;
  notificationsEnabled: boolean;
  silentMode: boolean;
  timestamp?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteProfileRequest {
  password: string;
}

export interface SessionSecurityInfo {
  device: string;
  ipAddress: string;
  startedAt: string;
}

export interface BackendSessionSecurityInfo {
  device: string;
  ipAddress: string;
  startedAt?: string;
}