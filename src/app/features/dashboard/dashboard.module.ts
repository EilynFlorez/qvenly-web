import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { PlanChartComponent } from './components/plan-chart/plan-chart.component';
import { MonthlyChartComponent } from './components/monthly-chart/monthly-chart.component';
import { OrganizerChartComponent } from './components/organizer-chart/organizer-chart.component';
import { UsersByEventComponent } from './components/users-by-event/users-by-event.component';
import { SharedModule } from '../../shared/shared.module';
import { FiltersComponent } from './components/filters/filters.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ToastComponent } from './components/toast/toast.component';
import { ChatbotAdminComponent } from './components/chatbot-admin/chatbot-admin.component';


@NgModule({
  declarations: [
    DashboardComponent,
    KpiCardsComponent,
    PlanChartComponent,
    MonthlyChartComponent,
    OrganizerChartComponent,
    UsersByEventComponent,
    FiltersComponent,
    ToastComponent,
    ChatbotAdminComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DashboardModule { }
