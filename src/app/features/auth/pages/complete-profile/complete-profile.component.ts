import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../core/core-auth/services/profile.service';
import { UpdateProfileRequest } from '../../../../core/core-auth/models/profile.model';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent implements OnInit {

  form: UpdateProfileRequest = {
    name: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    documentType: 'CC',
    documentNumber: ''
  };

  displayName = '';
  displayEmail = '';
  loading = true;
  isLoading = false;
  errorMessage = '';
  touched: { [key: string]: boolean } = {};

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        const p = res.data;
        this.form.name          = p.name;
        this.form.email         = p.email;
        this.form.lastName      = p.lastName      || '';
        this.form.phoneNumber   = p.phoneNumber   || '';
        this.form.documentType  = p.documentType  || 'CC';
        this.form.documentNumber = p.documentNumber || '';
        this.displayName  = p.name;
        this.displayEmail = p.email;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  touch(field: string): void {
    this.touched[field] = true;
  }

  getLastNameError(): string {
    if (!this.touched['lastName']) return '';
    if (!this.form.lastName) return 'El apellido es requerido';
    if (this.form.lastName.trim().length < 2) return 'Mínimo 2 caracteres';
    return '';
  }

  getDocumentError(): string {
    if (!this.touched['documentNumber']) return '';
    if (!this.form.documentNumber) return 'El número de documento es requerido';
    if (!/^\d+$/.test(this.form.documentNumber)) return 'Solo se permiten números';
    return '';
  }

  getPhoneError(): string {
    if (!this.touched['phoneNumber']) return '';
    if (!this.form.phoneNumber) return 'El teléfono es requerido';
    if (!/^\+?[\d\s\-]{7,15}$/.test(this.form.phoneNumber)) return 'Formato inválido (ej: +573001234567)';
    return '';
  }

  fieldState(field: string): 'error' | 'success' | '' {
    if (!this.touched[field]) return '';
    const err = field === 'lastName'       ? this.getLastNameError()
              : field === 'documentNumber' ? this.getDocumentError()
              : field === 'phoneNumber'    ? this.getPhoneError()
              : '';
    return err ? 'error' : 'success';
  }

  onSubmit(): void {
    ['lastName', 'documentNumber', 'phoneNumber'].forEach(f => this.touched[f] = true);

    if (this.getLastNameError() || this.getDocumentError() || this.getPhoneError()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.updateProfile(this.form).subscribe({
      next: () => {
        this.router.navigate(['/dashboard-user']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Error al guardar el perfil. Intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }
}
