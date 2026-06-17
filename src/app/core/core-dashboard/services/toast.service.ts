import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../models/toast';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

   private toastSubject = new BehaviorSubject<Toast>({
    message: '',
    icon: '',
    visible: false
  });

  toast$ = this.toastSubject.asObservable();

  show(message: string, icon: string = 'ti-info-circle'): void {
    this.toastSubject.next({ message, icon, visible: true });

    // Se oculta automáticamente después de 4 segundos
    setTimeout(() => {
      this.toastSubject.next({ message: '', icon: '', visible: false });
    }, 4000);
  }
}
