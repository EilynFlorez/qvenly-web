import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NavAdminComponent } from './components/nav-admin/nav-admin.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';



@NgModule({
  declarations: [
    TopbarComponent,
    NavAdminComponent,
    SkeletonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NavAdminComponent,
    TopbarComponent, 
    SkeletonComponent,
  ]
})
export class SharedModule { }
