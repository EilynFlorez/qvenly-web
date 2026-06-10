import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardUserRoutingModule } from './dashboard-user-routing.module';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { MiPlanComponent } from './pages/mi-plan/mi-plan.component';
import { MisEventosComponent } from './pages/mis-eventos/mis-eventos.component';
import { InvitacionesComponent } from './pages/invitaciones/invitaciones.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlanesComponent } from './pages/planes/planes.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    NotificationBellComponent,
    DashboardUserComponent,
    MiPlanComponent,
    MisEventosComponent,
    InvitacionesComponent,
    NotificationsComponent,
    PaymentResultComponent,
    ProfileComponent,
    PlanesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardUserRoutingModule
  ]
})
export class DashboardUserModule {}
