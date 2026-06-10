import { Component, Input, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
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

  userInitials = '';
  notifications: NotificationInbox[] = [];
  unreadCount = 0;
  showNotifications = false;
  loadingNotifs = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
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
}
