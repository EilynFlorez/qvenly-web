import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WompiTokenizationService } from '../../core/core-payments/services/wompi-tokenization-service.service';
import { PaymentService } from '../../core/core-payments/services/payment.service';
import { AuthService } from '../../core/core-auth/services/auth.service';

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss']
})
export class CardFormComponent {

  cardForm: FormGroup;
  loading = false;
  error = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private wompiTokenization: WompiTokenizationService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {
    this.cardForm = this.fb.group({
      cardHolder: ['', Validators.required],
      number: ['', [Validators.required, Validators.minLength(13)]],
      expMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.cardForm.invalid) return;

    this.loading = true;
    this.error = '';

    const userId = this.authService.getUserId();
    const userEmail = this.authService.getUserEmail() ?? '';

    // Paso 1: tokenizar la tarjeta directo contra Wompi
    this.wompiTokenization.tokenizeCard(this.cardForm.value).subscribe({
      next: (cardToken) => {
        // Paso 2: enviar SOLO el token a nuestro backend
        this.paymentService.registerPaymentSource({
          userId: userId!,
          cardToken,
          customerEmail: userEmail
        }).subscribe({
          next: () => {
            this.success = true;
            this.loading = false;
          },
          error: () => {
            this.error = 'No pudimos guardar tu tarjeta. Intenta de nuevo.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Datos de tarjeta inválidos. Revisa la información.';
        this.loading = false;
      }
    });
  }
}