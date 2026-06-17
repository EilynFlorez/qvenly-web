import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SupportFormComponent } from './components/support-form/support-form.component';
import { HelpCategoryPageComponent } from './pages/help-category-page/help-category-page.component';
import { HelpCenterPageComponent } from './pages/help-center-page/help-center-page.component';
import { MySupportTicketsPageComponent } from './pages/my-support-tickets-page/my-support-tickets-page.component';
import { UserHelpRoutingModule } from './user-help-routing.module';

@NgModule({
  declarations: [
    HelpCenterPageComponent,
    HelpCategoryPageComponent,
    MySupportTicketsPageComponent,
    SupportFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    UserHelpRoutingModule
  ]
})
export class UserHelpModule { }
