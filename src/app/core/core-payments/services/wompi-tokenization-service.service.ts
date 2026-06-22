import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface CardData {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

/**
 * Servicio que tokeniza tarjetas directamente contra la API de Wompi.
 * IMPORTANTE: nunca enviamos estos datos a nuestro propio backend.
 */
@Injectable({
  providedIn: 'root'
})
export class WompiTokenizationService {

  // URL directa a Wompi (sandbox), no a nuestro Gateway
  private wompiApiUrl = 'https://sandbox.wompi.co/v1';

  constructor(private http: HttpClient) {}

  /**
   * Tokeniza los datos de la tarjeta. Devuelve un token de un solo uso
   * que se le pasa al backend (nunca el número de tarjeta).
   */
  tokenizeCard(card: CardData): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.wompiPublicKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      number: card.number.replace(/\s/g, ''),
      cvc: card.cvc,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      card_holder: card.cardHolder
    };

    return this.http.post<any>(`${this.wompiApiUrl}/tokens/cards`, body, { headers })
      .pipe(
        map(response => response.data.id) // ej: "tok_test_xxxxx"
      );
  }
}