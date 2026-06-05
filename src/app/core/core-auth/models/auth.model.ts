export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  documentNumber: string;
  documentType: 'CC' | 'CE' | 'PASSPORT' | 'TI';
  phoneNumber: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  name: string;
  role: string;
  userId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
