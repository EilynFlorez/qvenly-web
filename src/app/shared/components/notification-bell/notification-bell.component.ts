import { Component, OnInit, HostListener } from '@angular/core';
import { ProfileService } from '../../../core/core-auth/services/profile.service';
import { NotificationInbox } from '../../../core/core-auth/models/profile.model';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit {

  notifications: NotificationInbox[] = [];
  unreadCount = 0;
  showNotifications = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.profileService.getInbox().subscribe({
      next: (res) => {
        this.notifications = res.data.slice(0, 5);
        this.unreadCount = res.data.filter(n => !n.read).length;
      },
      error: () => {}
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

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showNotifications = false;
  }
}
