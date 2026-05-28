import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
      @Input() type: 'chart' | 'cards' | 'table' = 'chart';
      @Input() height: number = 260;
}
