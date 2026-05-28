import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  isLoading = true;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'El enlace de confirmación no es válido.';
      return;
    }

    this.authService.confirmEmail(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.success = true;
          this.router.navigate(['/auth/login'], {
            queryParams: { confirmed: 'true' }
          });
        } else {
          this.errorMessage = response.message;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'El enlace de confirmación no es válido o ya fue usado.';
      }
    });
  }
}
