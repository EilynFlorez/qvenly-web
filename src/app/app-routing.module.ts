import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/core-auth/guards/auth.guard';
import { roleGuard } from './core/core-auth/guards/role.guard';
import { guestGuard } from './core/core-auth/guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.module').then(m => m.HomeModule)
      }
    ]
  },

  {
    path: 'plans',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/plans/plans.module').then(m => m.PlansModule)
      }
    ]
  },

  {
    path: 'profile',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/profile/profile.module').then(m => m.ProfileModule)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: 'dashboard-user',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard-user/dashboard-user.module').then(m => m.DashboardUserModule)
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
