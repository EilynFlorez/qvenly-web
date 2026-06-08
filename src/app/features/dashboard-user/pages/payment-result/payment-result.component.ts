import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Componente que maneja el redirect de Wompi después del checkout.
 *
 * Wompi redirige a /dashboard-user/payment/result con estos query params:
 *   ?id={wompiTransactionId}
 *   &status=APPROVED | DECLINED | VOIDED | PENDING
 *   &reference={nuestraReferencia: userId-planId-timestamp}
 *
 * Este componente lee esos params y muestra el resultado correspondiente.
 * El plan ya fue activado por el webhook en el backend — este componente
 * solo muestra feedback visual al usuario.
 */
@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {

  // Estado leído desde los query params de Wompi
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'PENDING' | 'UNKNOWN' = 'UNKNOWN';
  reference = '';
  transactionId = '';

  // Helpers para el template
  get isApproved(): boolean { return this.status === 'APPROVED'; }
  get isFailed(): boolean {
    return this.status === 'DECLINED' || this.status === 'VOIDED';
  }
  get isPending(): boolean { return this.status === 'PENDING'; }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Leer query params que envía Wompi en el redirect
    const params = this.route.snapshot.queryParams;
    this.transactionId = params['id'] || '';
    this.reference     = params['reference'] || '';

    const rawStatus = (params['status'] || '').toUpperCase();
    this.status = ['APPROVED', 'DECLINED', 'VOIDED', 'PENDING'].includes(rawStatus)
      ? rawStatus as any
      : 'UNKNOWN';

    // Si el pago fue aprobado, redirigir al dashboard después de 4 segundos
    if (this.isApproved) {
      setTimeout(() => this.router.navigate(['/dashboard-user']), 4000);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard-user']);
  }

  retry(): void {
    this.router.navigate(['/dashboard-user']);
  }
}