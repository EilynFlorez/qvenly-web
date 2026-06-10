import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { NavComponent } from './nav/nav.component';
import { TopbarComponent } from './topbar/topbar.component';
import { NavAdminComponent } from './nav-admin/nav-admin.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ProfileComponent } from '../features/dashboard-user/pages/profile/profile.component';
import { NotificationsComponent } from '../features/dashboard-user/pages/notifications/notifications.component';

@NgModule({
  declarations: [
    FooterComponent,
    NavComponent,
    TopbarComponent,
    NavAdminComponent,
    SkeletonComponent,
    AdminLayoutComponent,
    ProfileComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    NavAdminComponent,
    TopbarComponent,
    SkeletonComponent,
    NavComponent,
    FooterComponent,
    AdminLayoutComponent,
    ProfileComponent,
    NotificationsComponent
  ]
})
export class SharedModule { }
