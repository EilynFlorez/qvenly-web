import { Component } from '@angular/core';
import { ToastService } from '../../../../core/core-dashboard/services/toast.service';
import { Toast } from '../../../../core/core-dashboard/models/toast';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {

   toast: Toast = { message: '', icon: '', visible: false };

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe(toast => {
      this.toast = toast;
    });
  }
}
