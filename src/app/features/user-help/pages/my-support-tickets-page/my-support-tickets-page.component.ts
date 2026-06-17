import { Component, OnInit } from '@angular/core';
import { SupportTicketResponse } from '../../../../core/core-user-help/models/user-help.model';
import { UserHelpService } from '../../../../core/core-user-help/services/user-help.service';

@Component({
  selector: 'app-my-support-tickets-page',
  templateUrl: './my-support-tickets-page.component.html',
  styleUrl: './my-support-tickets-page.component.scss'
})
export class MySupportTicketsPageComponent implements OnInit {

  tickets: SupportTicketResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(private userHelpService: UserHelpService) { }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userHelpService.getMySupportTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets || [];
        this.loading = false;
      },
      error: () => {
        this.tickets = [];
        this.loading = false;
        this.errorMessage = 'No pudimos cargar tus solicitudes de soporte.';
      }
    });
  }

  onTicketCreated(): void {
    this.loadTickets();
  }

  trackByTicket(_: number, ticket: SupportTicketResponse): string {
    return ticket.id;
  }
}
