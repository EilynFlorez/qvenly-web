import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

  {
    path: 'plans',
    loadChildren: () =>
      import('./features/plans/plans.module').then((m) => m.PlansModule)
  },

  {
    path: '**',
    redirectTo: ''
  }
  ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
