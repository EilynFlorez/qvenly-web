import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NotificationInbox } from '../../../core/core-auth/models/profile.model';
import { UnifiedNotificationService } from '../../../core/unified-notification.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  notifications: NotificationInbox[] = [];
  unreadCount = 0;
  showNotifications = false;
  private pollingSub!: Subscription;

  constructor(private unifiedNotificationService: UnifiedNotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();

    this.pollingSub = interval(30000).pipe(
      switchMap(() => this.unifiedNotificationService.getAllNotifications())
    ).subscribe({
      next: (notifications) => {
        this.notifications = notifications.slice(0, 5);
        this.unreadCount = notifications.filter(n => !n.read).length;
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  loadNotifications(): void {
    this.unifiedNotificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications.slice(0, 5);
        this.unreadCount = notifications.filter(n => !n.read).length;
      },
      error: () => {}
    });
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: NotificationInbox, event: Event): void {
    event.stopPropagation();
    this.unifiedNotificationService.markAsRead(notification).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          (n.id === notification.id && n.source === notification.source)
            ? { ...n, read: true } : n
        );
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }
    });
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notifications.filter(n => !n.read).forEach(n => {
      this.unifiedNotificationService.markAsRead(n).subscribe({
        next: () => {
          this.notifications = this.notifications.map(x =>
            (x.id === n.id && x.source === n.source) ? { ...x, read: true } : x
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