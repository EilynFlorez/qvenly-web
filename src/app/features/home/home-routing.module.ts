import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AyudaComponent } from './pages/ayuda/ayuda.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { CasosDeUsoComponent } from './pages/casos-de-uso/casos-de-uso.component';
import { TerminosComponent } from './pages/terminos/terminos.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { CookiesComponent } from './pages/cookies/cookies.component';

const routes: Routes = [
  { path: '',             component: HomeComponent },
  { path: 'ayuda',        component: AyudaComponent },
  { path: 'contacto',     component: ContactoComponent },
  { path: 'casos-de-uso', component: CasosDeUsoComponent },
  { path: 'terminos',     component: TerminosComponent },
  { path: 'privacidad',   component: PrivacidadComponent },
  { path: 'cookies',      component: CookiesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
