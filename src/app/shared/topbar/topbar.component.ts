import { HttpClient } from '@angular/common/http';
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

  showExportModal: boolean = false;

  constructor(private http: HttpClient) { }

  openModal(): void {
    this.showExportModal = true;
  }

  closeModal(): void {
    this.showExportModal = false;
  }

  exportExcel(): void {
    this.http.get('http://localhost:9000/admin/report/excel', {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-dashboard.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
    this.closeModal();
  }

  exportPdf(): void {
    this.http.get('http://localhost:9000/admin/report/pdf', {
      responseType: 'blob' as 'json'
    }).subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-dashboard.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
    this.closeModal();
  }
}
