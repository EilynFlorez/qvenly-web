import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { EventTypesComponent } from './components/event-types/event-types.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { HomeComponent } from './pages/home/home.component';
import { PricingSectionComponent } from './components/pricing-section/pricing-section.component';


@NgModule({
  declarations: [
    CtaSectionComponent,
    EventTypesComponent,
    FeaturesSectionComponent,
    HomeComponent,
    PricingSectionComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
