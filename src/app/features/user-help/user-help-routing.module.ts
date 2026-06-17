import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpCategoryPageComponent } from './pages/help-category-page/help-category-page.component';
import { HelpCenterPageComponent } from './pages/help-center-page/help-center-page.component';
import { MySupportTicketsPageComponent } from './pages/my-support-tickets-page/my-support-tickets-page.component';

const routes: Routes = [
  {
    path: '',
    component: HelpCenterPageComponent
  },
  {
    path: 'category/:slug',
    component: HelpCategoryPageComponent
  },
  {
    path: 'support/my',
    component: MySupportTicketsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserHelpRoutingModule { }
