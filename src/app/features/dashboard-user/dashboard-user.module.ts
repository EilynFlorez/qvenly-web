import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardUserRoutingModule } from './dashboard-user-routing.module';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';

@NgModule({
  declarations: [
    DashboardUserComponent,
    PaymentResultComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashboardUserRoutingModule
  ]
})
export class DashboardUserModule {}