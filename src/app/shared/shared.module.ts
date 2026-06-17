import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { NavComponent } from './nav/nav.component';
import { RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from './topbar/topbar.component';
import { NavAdminComponent } from './nav-admin/nav-admin.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { HelpChatbotComponent } from '../features/user-help/components/help-chatbot/help-chatbot.component';



@NgModule({
  declarations: [
    FooterComponent,
    NavComponent,
    TopbarComponent,
    NavAdminComponent,
    SkeletonComponent,
    AdminLayoutComponent,
    HelpChatbotComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule 
  ],
  exports: [
    NavAdminComponent,
    TopbarComponent, 
    SkeletonComponent,
    NavComponent, 
    FooterComponent,
    AdminLayoutComponent,
    HelpChatbotComponent
  ]
  
})
export class SharedModule { }
