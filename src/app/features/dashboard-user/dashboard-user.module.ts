import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarDateFormatter, CalendarModule, CalendarNativeDateFormatter, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

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
import { ActivityDetailComponent } from './pages/activity-detail/activity-detail.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);
import { EventSurveysComponent } from './pages/event-surveys/event-surveys.component';
import { SurveyResultsComponent } from './pages/survey-results/survey-results.component';
import { UserSurveysComponent } from './pages/user-surveys/user-surveys.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

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
    EventHistoryComponent,
    ActivityDetailComponent,
    EventSurveysComponent,
    SurveyResultsComponent,
    UserSurveysComponent,
    ChatbotComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    DashboardUserRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: CalendarDateFormatter, useClass: CalendarNativeDateFormatter }
  ]
})
export class DashboardUserModule { }
