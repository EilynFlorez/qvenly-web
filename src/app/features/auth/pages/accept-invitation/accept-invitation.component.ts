import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { InvitationService } from '../../../../core/core-events/services/invitation.service';
import { InvitationResponse } from '../../../../core/core-events/models/event.model';

@Component({
  selector: 'app-accept-invitation',
  templateUrl: './accept-invitation.component.html',
  styleUrls: ['./accept-invitation.component.scss']
})
export class AcceptInvitationComponent implements OnInit {

  loading = true;
  error = '';
  invitation: InvitationResponse | null = null;
  accepting = false;
  processingError = '';

  private token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private invitationService: InvitationService
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.error = 'El enlace de invitación no es válido o está incompleto.';
      this.loading = false;
      return;
    }

    this.token = token;

    this.invitationService.previewInvitation(token).subscribe({
      next: (res) => {
        this.invitation = res.data;
        this.loading = false;
        if (this.authService.isAuthenticated()) {
          this.acceptNow();
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Esta invitación no existe o ya no es válida.';
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    localStorage.setItem('pendingInvitationToken', this.token);
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    localStorage.setItem('pendingInvitationToken', this.token);
    this.router.navigate(['/auth/register']);
  }

  acceptNow(): void {
    this.accepting = true;
    this.processingError = '';
    this.invitationService.acceptInvitation(this.token).subscribe({
      next: () => {
        this.router.navigate(['/dashboard-user/events']);
      },
      error: (err) => {
        this.processingError = err.error?.message || 'Error al aceptar la invitación.';
        this.accepting = false;
      }
    });
  }
}
