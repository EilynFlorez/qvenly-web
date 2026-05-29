import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanChartComponent } from './plan-chart.component';

describe('PlanChartComponent', () => {
  let component: PlanChartComponent;
  let fixture: ComponentFixture<PlanChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
