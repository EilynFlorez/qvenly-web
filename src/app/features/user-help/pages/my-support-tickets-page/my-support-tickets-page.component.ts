import { Component, OnInit } from '@angular/core';
import { SupportResponse, SupportTicketResponse } from '../../../../core/core-user-help/models/user-help.model';
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
  expandedTicketId: string | null = null;
  ticketResponses: SupportResponse[] = [];
  loadingResponses = false;

  constructor(private userHelpService: UserHelpService) { }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.expandedTicketId = null;
    this.ticketResponses = [];

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

  toggleResponses(ticketId: string): void {
    if (this.expandedTicketId === ticketId) {
      this.expandedTicketId = null;
      this.ticketResponses = [];
      return;
    }

    this.expandedTicketId = ticketId;
    this.loadingResponses = true;
    this.ticketResponses = [];

    this.userHelpService.getTicketResponses(ticketId).subscribe({
      next: (responses) => {
        this.ticketResponses = responses || [];
        this.loadingResponses = false;
      },
      error: () => {
        this.ticketResponses = [];
        this.loadingResponses = false;
      }
    });
  }

  onTicketCreated(): void {
    this.loadTickets();
  }

  trackByTicket(_: number, ticket: SupportTicketResponse): string {
    return ticket.id;
  }

  trackByResponse(_: number, response: SupportResponse): string {
    return response.respondedAt + response.message;
  }
}
