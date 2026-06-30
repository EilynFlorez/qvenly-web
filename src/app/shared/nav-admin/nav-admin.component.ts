import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/core-auth/services/auth.service';

@Component({
  selector: 'app-nav-admin',
  templateUrl: './nav-admin.component.html',
  styleUrl: './nav-admin.component.scss'
})
export class NavAdminComponent implements OnInit {

  userName = '';
  userEmail = '';
  userInitials = '';
  sidebarOpen = true;
  @Output() sidebarToggled = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || '';
    this.userEmail = localStorage.getItem('email') || '';
    this.userInitials = this.userName
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'AD';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarToggled.emit(this.sidebarOpen);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => { this.authService.clearSession(); this.router.navigate(['/auth/login']); },
      error: () => { this.authService.clearSession(); this.router.navigate(['/auth/login']); }
    });
  }
}
