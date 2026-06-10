import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/core-auth/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {

  userName = '';
  userEmail = '';
  userInitials = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName     = this.authService.getUserName() || '';
    this.userEmail    = localStorage.getItem('email') || '';
    this.userInitials = this.userName
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => { this.authService.clearSession(); this.router.navigate(['/auth/login']); },
      error: () => { this.authService.clearSession(); this.router.navigate(['/auth/login']); }
    });
  }
}
