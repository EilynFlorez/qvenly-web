import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthResponse,
  ApiResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`,
      request,
      { withCredentials: true }
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/register`,
      request,
      { withCredentials: true }
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/forgot-password`,
      request
    );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }

  resetPassword(request: { token: string; newPassword: string; confirmPassword: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, request);
  }

  confirmEmail(token: string): Observable<ApiResponse<void>> {
    return this.http.get<ApiResponse<void>>(
      `${environment.apiUrl}/auth/confirm-email?token=${token}`,
      { withCredentials: true }
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/refresh-from-cookie`,
      {},
      { withCredentials: true }
    );
  }

  saveUserInfo(name: string, email: string, role: string, userId: number): void {
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId.toString());
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }

  getUserName(): string | null {
    return localStorage.getItem('name');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('email');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    return !!role && !!userId;
  }

  clearSession(): void {
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }
}