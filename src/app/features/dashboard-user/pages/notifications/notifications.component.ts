import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../core/core-auth/services/profile.service';
import { NotificationInbox } from '../../../../core/core-auth/models/profile.model';

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

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = false;
    this.profileService.getInbox().subscribe({
      next: (res) => {
        this.notifications = res.data;
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: number): void {
    this.profileService.markAsRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
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
      this.profileService.markAsRead(n.id).subscribe({
        next: () => {
          this.notifications = this.notifications.map(x =>
            x.id === n.id ? { ...x, read: true } : x
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
