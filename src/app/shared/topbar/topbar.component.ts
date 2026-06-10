import { Component, Input, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/core-auth/services/auth.service';
import { ProfileService } from '../../core/core-auth/services/profile.service';
import { NotificationInbox } from '../../core/core-auth/models/profile.model';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showExport: boolean = false;

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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const name = this.authService.getUserName() || '';
    this.userInitials = name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'AD';
    this.loadNotifications();
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