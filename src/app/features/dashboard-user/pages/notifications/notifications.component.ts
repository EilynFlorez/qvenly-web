import { Component, OnInit } from '@angular/core';
import { NotificationInbox } from '../../../../core/core-auth/models/profile.model';
import { UnifiedNotificationService } from '../../../../core/unified-notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  notifications: NotificationInbox[] = [];
  loading = true;
  error = false;
  markingAll = false;

  constructor(private unifiedNotificationService: UnifiedNotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = false;
    this.unifiedNotificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notification: NotificationInbox): void {
    this.unifiedNotificationService.markAsRead(notification).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          (n.id === notification.id && n.source === notification.source)
            ? { ...n, read: true } : n
        );
      }
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter(n => !n.read);
    if (!unread.length) return;
    this.markingAll = true;

    let completed = 0;
    unread.forEach(n => {
      this.unifiedNotificationService.markAsRead(n).subscribe({
        next: () => {
          this.notifications = this.notifications.map(x =>
            (x.id === n.id && x.source === n.source) ? { ...x, read: true } : x
          );
          completed++;
          if (completed === unread.length) this.markingAll = false;
        }
      });
    });
  }

  getBadgeType(type: string): string {
    const t = type?.toUpperCase() ?? '';
    if (t.includes('PASSWORD'))  return 'amber';
    if (t.includes('PROFILE'))   return 'blue';
    if (t.includes('PLAN'))      return 'teal';
    if (t.includes('PAYMENT'))   return 'green';
    if (t.includes('EVENT'))     return 'purple';
    return 'gray';
  }

  formatType(type: string): string {
    return (type ?? 'NOTIFICACIÓN')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }
}