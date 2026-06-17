import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/core-auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'qvenly-web';
  showAssistant = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.updateAssistantVisibility(this.router.url);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => this.updateAssistantVisibility(event.urlAfterRedirects));
  }

  goToHelpSupport(): void {
    this.router.navigate(['/help/support/my']);
  }

  private updateAssistantVisibility(url: string): void {
    const isAuthRoute = url.startsWith('/auth');
    this.showAssistant = !isAuthRoute && this.authService.isAuthenticated();
  }
}
