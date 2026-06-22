/**
 * Solicitud para crear un pago de un plan.
 */
export interface CreatePaymentRequest {
  userId: number;
  planId: number;
  planName: string;
  price: number;
}

/**
 * Respuesta al crear el checkout de Wompi.
 * Contiene la URL a la que el frontend redirige al usuario.
 */
export interface CreatePaymentResponse {
  paymentId: number;
  reference: string;
  checkoutUrl: string;
}

/**
 * Registro de un pago en el historial del usuario.
 */
export interface PaymentRecord {
  id: number;
  userId: number;
  planId: number;
  reference: string;
  wompiTransactionId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta genérica del backend de pagos.
 */
export interface PaymentApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Solicitud para registrar una tarjeta tokenizada como fuente de pago reutilizable.
 * El cardToken viene de Wompi (tokenizado en el frontend), nunca el número de tarjeta.
 */
export interface CreatePaymentSourceRequest {
  userId: number;
  cardToken: string;
  customerEmail: string;
}

/**
 * Respuesta al registrar una fuente de pago.
 */
export interface PaymentSourceResponse {
  id: number;
  cardBrand: string;
  lastFour: string;
  active: boolean;
}