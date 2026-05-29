import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerChartComponent } from './organizer-chart.component';

describe('OrganizerChartComponent', () => {
  let component: OrganizerChartComponent;
  let fixture: ComponentFixture<OrganizerChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizerChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizerChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
