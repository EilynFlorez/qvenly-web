import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanListComponent } from './pages/plan-list/plan-list.component';
import { CreateFormComponent } from './pages/create-form/create-form.component';
import { UpdateFormComponent } from './pages/update-form/update-form.component';
import { PlanDetailComponent } from './pages/plan-detail/plan-detail.component';
import { AuditListComponent } from './pages/audit-list/audit-list.component';

const routes: Routes = [
  { path: '', component: PlanListComponent },
  { path: 'create', component: CreateFormComponent },
  { path: 'edit/:id', component: UpdateFormComponent },
  { path: 'audit', component: AuditListComponent},
  { path: ':id', component: PlanDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlansRoutingModule { }
