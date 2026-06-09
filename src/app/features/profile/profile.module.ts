import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProfileEditModalComponent } from './components/profile-edit-modal/profile-edit-modal.component';
import { ProfileSecurityComponent } from './components/profile-security/profile-security.component';
import { ProfileManagementComponent } from './pages/profile-management/profile-management.component';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
  declarations: [
    ProfileManagementComponent,
    ProfileSecurityComponent,
    ProfileEditModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }