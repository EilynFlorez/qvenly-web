export interface UserProfile {
  id: number;
  name: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  memberSince: string;
  lastAccess: string;
}

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
  phoneNumber: string;
}

export interface NotificationPreferences {
  systemNotifications: boolean;
  accountNotifications: boolean;
  planNotifications: boolean;
  silentMode: boolean;
}
