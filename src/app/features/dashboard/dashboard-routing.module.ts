import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from '../../shared/layouts/admin-layout/admin-layout.component';
import { ProfileComponent } from '../dashboard-user/pages/profile/profile.component';
import { NotificationsComponent } from '../dashboard-user/pages/notifications/notifications.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
