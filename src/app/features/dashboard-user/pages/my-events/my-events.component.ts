import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/core-events/services/event.service';
import { EventResponse, EventStatus } from '../../../../core/core-events/models/event.model';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss']
})
export class MyEventsComponent implements OnInit {

  events: EventResponse[] = [];
  loading = true;
  error = false;
  noPlan = false;
  statusFilter = 'ALL';

  private currentUserEmail = localStorage.getItem('email') || '';

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = false;
    this.noPlan = false;

    this.eventService.getMyEvents().subscribe({
      next: (res) => {
        if (res.success) this.events = res.data;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 403) this.noPlan = true;
        else this.error = true;
        this.loading = false;
      }
    });
  }

  get filteredEvents(): EventResponse[] {
    if (this.statusFilter === 'ALL') return this.events;
    return this.events.filter(e => e.status === this.statusFilter);
  }

  isOwner(event: EventResponse): boolean {
    return event.ownerEmail === this.currentUserEmail;
  }

  getStatusLabel(status: EventStatus): string {
    const labels: Record<EventStatus, string> = {
      DRAFT: 'Borrador', PUBLISHED: 'Publicado',
      IN_PROGRESS: 'En proceso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: EventStatus): string {
    const classes: Record<EventStatus, string> = {
      DRAFT: 'status--draft', PUBLISHED: 'status--published',
      IN_PROGRESS: 'status--inprogress', FINISHED: 'status--finished', CANCELLED: 'status--cancelled'
    };
    return classes[status] || '';
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard-user/events/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard-user/events', id]);
  }
}
