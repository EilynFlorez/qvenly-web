import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
import { PaymentResultComponent } from './pages/payment-result/payment-result.component';

const routes: Routes = [
  { path: '', component: DashboardUserComponent },
  // Wompi redirige siempre a esta URL con query params:
  // ?id={transactionId}&status=APPROVED|DECLINED|VOIDED&reference={nuestraReferencia}
  { path: 'payment/result', component: PaymentResultComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardUserRoutingModule {}