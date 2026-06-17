export interface UserProfileResponse {
  id: number;
  fullName: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  roles: string[];
  active: boolean;
  status: string;
  documentType: string | null;
  documentNumber: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  authProvider: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ConfirmPasswordRequest {
  password: string;
}

export interface ConfirmPasswordResponse {
  valid: boolean;
  validatedAt: string;
}

export interface DeleteProfileRequest {
  password: string;
}

export interface NotificationSettings {
  userId: number;
  notificationsEnabled: boolean;
  silentMode: boolean;
  timestamp: string;
}

export interface NotificationInbox {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  silent: boolean;
  status: string;
  createdAt: string;
  source?: 'auth' | 'plans';
}