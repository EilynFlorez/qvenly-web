import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardUserRoutingModule } from './dashboard-user-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { MiPlanComponent } from './pages/mi-plan/mi-plan.component';
import { MyEventsComponent } from './pages/my-events/my-events.component';
import { EventCreateComponent } from './pages/event-create/event-create.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { InvitationsComponent } from './pages/invitations/invitations.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { EventHistoryComponent } from './pages/event-history/event-history.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    DashboardUserComponent,
    MiPlanComponent,
    MyEventsComponent,
    EventCreateComponent,
    EventDetailComponent,
    InvitationsComponent,
    PaymentResultComponent,
    PlanesComponent,
    EventHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    DashboardUserRoutingModule
  ]
})
export class DashboardUserModule {}
