import { Component, Input, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/core-auth/services/auth.service';
import { ProfileService } from '../../core/core-auth/services/profile.service';
import { NotificationInbox } from '../../core/core-auth/models/profile.model';
import { FilterService } from '../../core/core-dashboard/services/filter.service';
import { DashboardFilters } from '../../core/core-dashboard/models/dashboard-filters';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showExport: boolean = false;

  // Filtros en los reportes

    currentFilters: DashboardFilters= {
    startDate: '',
    endDate: '',
    plan: ''
  };

  // ─── Usuario ───────────────────────────────────────────────────────────
  userInitials = '';

  // ─── Notificaciones ────────────────────────────────────────────────────
  notifications: NotificationInbox[] = [];
  unreadCount = 0;
  showNotifications = false;
  loadingNotifs = false;

  // ─── Export modal ──────────────────────────────────────────────────────
  showExportModal = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient,
     private filterService: FilterService
  ) {}

  ngOnInit(): void {
    const name = this.authService.getUserName() || '';
    this.userInitials = name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'AD';
    this.loadNotifications();

     this.filterService.filters$.subscribe(filters => {
    this.currentFilters = filters;
  });
  }

  // ─── Notificaciones ────────────────────────────────────────────────────
  loadNotifications(): void {
    this.loadingNotifs = true;
    this.profileService.getInbox().subscribe({
      next: (res) => {
        this.notifications = res.data.slice(0, 5);
        this.unreadCount = res.data.filter(n => !n.read).length;
        this.loadingNotifs = false;
      },
      error: () => { this.loadingNotifs = false; }
    });
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.profileService.markAsRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }
    });
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notifications.filter(n => !n.read).forEach(n => {
      this.profileService.markAsRead(n.id).subscribe({
        next: () => {
          this.notifications = this.notifications.map(x =>
            x.id === n.id ? { ...x, read: true } : x
          );
          this.unreadCount = this.notifications.filter(x => !x.read).length;
        }
      });
    });
  }

  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showNotifications = false;
  }

  // ─── Export modal ──────────────────────────────────────────────────────
  openModal(): void {
    this.showExportModal = true;
  }

  closeModal(): void {
    this.showExportModal = false;
  }

  exportExcel(): void {
  let url = 'http://localhost:9000/admin/report/excel';
  const params = this.buildParams();
  if (params) url += '?' + params;

  this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'reporte-dashboard.xlsx';
    a.click();
    window.URL.revokeObjectURL(a.href);
  });
  this.closeModal();
}

exportPdf(): void {
  let url = 'http://localhost:9000/admin/report/pdf';
  const params = this.buildParams();
  if (params) url += '?' + params;

  this.http.get(url, { responseType: 'blob' as 'json' }).subscribe((blob: any) => {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'reporte-dashboard.pdf';
    a.click();
    window.URL.revokeObjectURL(a.href);
  });
  this.closeModal();
}

// Construye los parámetros de filtro
private buildParams(): string {
  const params: string[] = [];
  if (this.currentFilters.startDate) 
    params.push(`startDate=${this.currentFilters.startDate}`);
  if (this.currentFilters.endDate)   
    params.push(`endDate=${this.currentFilters.endDate}`);
  if (this.currentFilters.plan)      
    params.push(`plan=${this.currentFilters.plan}`);
  return params.join('&');
}
}