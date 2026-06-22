import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  CreatePaymentSourceRequest,
  PaymentApiResponse,
  PaymentRecord,
  PaymentSourceResponse
} from '../models/payment.model';

/**
 * Servicio para la gestión de pagos
 * Maneja la creación de preferencias de pago y consulta del historial.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  /**
   * Crea una preferencia de pago en MercadoPago.
   * Devuelve la URL de checkout a la que se debe redirigir al usuario.
   *
   * @param request datos del plan a pagar
   */
  createPayment(request: CreatePaymentRequest): Observable<PaymentApiResponse<CreatePaymentResponse>> {
    return this.http.post<PaymentApiResponse<CreatePaymentResponse>>(
      `${this.apiUrl}/create`,
      request,
      { withCredentials: true }
    );
  }

  /**
   * Obtiene el historial de pagos de un usuario.
   *
   * @param userId ID del usuario
   */
  getPaymentsByUser(userId: number): Observable<PaymentApiResponse<PaymentRecord[]>> {
    return this.http.get<PaymentApiResponse<PaymentRecord[]>>(
      `${this.apiUrl}/user/${userId}`,
      { withCredentials: true }
    );
  }

  /**
 * Registra una tarjeta tokenizada como fuente de pago reutilizable,
 * para poder cobrar renovaciones automáticas más adelante.
 *
 * @param request token de tarjeta (generado por Wompi en el frontend) y datos del usuario
 */
  registerPaymentSource(request: CreatePaymentSourceRequest): Observable<PaymentApiResponse<PaymentSourceResponse>> {
    return this.http.post<PaymentApiResponse<PaymentSourceResponse>>(
      `${this.apiUrl}/payment-source`,
      request,
      { withCredentials: true }
    );
  }
}
