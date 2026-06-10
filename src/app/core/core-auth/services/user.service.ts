import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { UserProfile } from '../models/user.model';

/**
 * Servicio para consultar información de usuarios desde el auth-service.
 * Usado para enriquecer datos con el nombre del usuario en otros módulos.
 */

@Injectable({
  providedIn: 'root'
})
export class UserService {

   /** URL base del endpoint de usuarios */
  private apiUrl = `${environment.apiUrl}/auth/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la información de un usuario por su ID.
   * @param id ID del usuario
   * @returns Observable con los datos del usuario
   */
  getUserById(id: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/${id}`);
  }
}
