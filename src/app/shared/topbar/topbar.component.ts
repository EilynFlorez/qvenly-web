import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
      @Input() title: string = '';
      @Input() subtitle: string = '';
      @Input() showExport: boolean = false;
}
