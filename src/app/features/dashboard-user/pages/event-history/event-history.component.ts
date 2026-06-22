import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/core-events/services/event.service';
import { EventResponse } from '../../../../core/core-events/models/event.model';

@Component({
  selector: 'app-event-history',
  templateUrl: './event-history.component.html',
  styleUrls: ['./event-history.component.scss']
})
export class EventHistoryComponent implements OnInit {

  events: EventResponse[] = [];
  loading = true;
  error = false;
  searchTerm = '';

  private currentUserEmail = localStorage.getItem('email') || '';

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = false;

    this.eventService.getMyEvents().subscribe({
      next: (res) => {
        if (res.success) this.events = res.data.filter(e => e.status === 'FINISHED');
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  get filteredEvents(): EventResponse[] {
    if (!this.searchTerm.trim()) return this.events;
    const term = this.searchTerm.trim().toLowerCase();
    return this.events.filter(e =>
      e.title.toLowerCase().includes(term) ||
      (e.description && e.description.toLowerCase().includes(term)) ||
      e.eventType.toLowerCase().includes(term)
    );
  }

  isOwner(event: EventResponse): boolean {
    return event.ownerEmail === this.currentUserEmail;
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard-user/events', id]);
  }
}
