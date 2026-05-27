import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { NavComponent } from './nav/nav.component';
import { RouterModule} from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NavAdminComponent } from './components/nav-admin/nav-admin.component';



@NgModule({
  declarations: [
    FooterComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
    RouterModule 
  ],
  exports: [
    NavComponent, 
    FooterComponent
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
