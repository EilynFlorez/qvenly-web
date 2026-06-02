import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Componente modal de éxito reutilizable.
 * Muestra un mensaje de confirmación tras una acción exitosa.
 */
@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss'
})
export class SuccessModalComponent {

  /** Título del modal */
  @Input() title: string = '¡Operación exitosa!';

  /** Mensaje descriptivo */
  @Input() message: string = '';

  /** Evento emitido cuando el usuario acepta */
  @Output() accepted = new EventEmitter<void>();

  /**
   * Emite el evento de aceptación.
   */
  accept(): void {
    this.accepted.emit();
  }
}