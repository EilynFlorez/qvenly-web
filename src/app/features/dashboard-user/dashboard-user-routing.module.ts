import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { MiPlanComponent } from './pages/mi-plan/mi-plan.component';
import { MisEventosComponent } from './pages/mis-eventos/mis-eventos.component';
import { InvitacionesComponent } from './pages/invitaciones/invitaciones.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlanesComponent } from './pages/planes/planes.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '',                component: DashboardUserComponent },
      { path: 'plan',            component: MiPlanComponent },
      { path: 'planes',          component: PlanesComponent },
      { path: 'eventos',         component: MisEventosComponent },
      { path: 'invitaciones',    component: InvitacionesComponent },
      { path: 'notifications',   component: NotificationsComponent },
      { path: 'profile',         component: ProfileComponent },
      { path: 'payment/result',  component: PaymentResultComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardUserRoutingModule {}
