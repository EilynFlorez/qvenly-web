import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { MiPlanComponent } from './pages/mi-plan/mi-plan.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { MyEventsComponent } from './pages/my-events/my-events.component';
import { EventCreateComponent } from './pages/event-create/event-create.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { InvitationsComponent } from './pages/invitations/invitations.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';
import { EventHistoryComponent } from './pages/event-history/event-history.component';
import { ActivityDetailComponent } from './pages/activity-detail/activity-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '',                component: DashboardUserComponent },
      { path: 'plan',            component: MiPlanComponent },
      { path: 'planes',          component: PlanesComponent },
      { path: 'events',          component: MyEventsComponent },
      { path: 'events/new',      component: EventCreateComponent },
      { path: 'events/:id',      component: EventDetailComponent },
      { path: 'invitations',     component: InvitationsComponent },
      { path: 'history',         component: EventHistoryComponent },
      { path: 'notifications',   component: NotificationsComponent },
      { path: 'profile',         component: ProfileComponent },
      { path: 'payment/result',  component: PaymentResultComponent },
      { path: 'activities/:id',  component: ActivityDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardUserRoutingModule {}
