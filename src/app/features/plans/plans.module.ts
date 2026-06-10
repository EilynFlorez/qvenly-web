import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlansRoutingModule } from './plans-routing.module';
import { CreateFormComponent } from './pages/create-form/create-form.component';
import { UpdateFormComponent } from './pages/update-form/update-form.component';
import { PlanListComponent } from './pages/plan-list/plan-list.component';
import { PlanDetailComponent } from './pages/plan-detail/plan-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PlanCardComponent } from './components/plan-card/plan-card.component';
import { PlanFormComponent } from './components/plan-form/plan-form.component';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { SuccessModalComponent } from './components/success-modal/success-modal.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { PlanDetailCardComponent } from './components/plan-detail-card/plan-detail-card.component';
import { AuditTableComponent } from './components/audit-table/audit-table.component';
import { AuditFiltersComponent } from './components/audit-filters/audit-filters.component';
import { AuditListComponent } from './pages/audit-list/audit-list.component';
import { PlanOrganizersComponent } from './components/plan-organizers/plan-organizers.component';


@NgModule({
  declarations: [
    CreateFormComponent,
    UpdateFormComponent,
    PlanListComponent,
    PlanDetailComponent,
    PlanCardComponent,
    PlanFormComponent,
    DeleteModalComponent,
    SuccessModalComponent,
    FormFieldComponent,
    PlanDetailCardComponent,
    AuditTableComponent,
    AuditFiltersComponent,
    AuditListComponent,
    PlanOrganizersComponent
  ],
  imports: [
    CommonModule,
    PlansRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    SharedModule
  ]
})
export class PlansModule { }
