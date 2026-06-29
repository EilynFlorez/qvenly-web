import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { EventTypesComponent } from './components/event-types/event-types.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { HomeComponent } from './pages/home/home.component';
import { PricingSectionComponent } from './components/pricing-section/pricing-section.component';
import { AyudaComponent } from './pages/ayuda/ayuda.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { CasosDeUsoComponent } from './pages/casos-de-uso/casos-de-uso.component';
import { TerminosComponent } from './pages/terminos/terminos.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { CookiesComponent } from './pages/cookies/cookies.component';


@NgModule({
  declarations: [
    CtaSectionComponent,
    EventTypesComponent,
    FeaturesSectionComponent,
    HomeComponent,
    PricingSectionComponent,
    AyudaComponent,
    ContactoComponent,
    CasosDeUsoComponent,
    TerminosComponent,
    PrivacidadComponent,
    CookiesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
