import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { KpiCardsComponent } from './pages/kpi-cards/kpi-cards.component';
import { PlanChartComponent } from './pages/plan-chart/plan-chart.component';
import { MonthlyChartComponent } from './pages/monthly-chart/monthly-chart.component';
import { OrganizerChartComponent } from './pages/organizer-chart/organizer-chart.component';
import { UsersByEventComponent } from './pages/users-by-event/users-by-event.component';
import { SharedModule } from '../../shared/shared.module';
import { FiltersComponent } from './pages/filters/filters.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DashboardComponent,
    KpiCardsComponent,
    PlanChartComponent,
    MonthlyChartComponent,
    OrganizerChartComponent,
    UsersByEventComponent,
    FiltersComponent, 
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ]
})
export class DashboardModule { }
