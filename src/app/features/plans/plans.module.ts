import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlansRoutingModule } from './plans-routing.module';
import { CreateFormComponent } from './pages/create-form/create-form.component';
import { UpdateFormComponent } from './pages/update-form/update-form.component';
import { PlanListComponent } from './pages/plan-list/plan-list.component';
import { PlanDetailComponent } from './pages/plan-detail/plan-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    CreateFormComponent,
    UpdateFormComponent,
    PlanListComponent,
    PlanDetailComponent
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
