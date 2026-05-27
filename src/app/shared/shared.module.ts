import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NavAdminComponent } from './components/nav-admin/nav-admin.component';



@NgModule({
  declarations: [
    TopbarComponent,
    NavAdminComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NavAdminComponent,
    TopbarComponent
  ]
})
export class SharedModule { }
