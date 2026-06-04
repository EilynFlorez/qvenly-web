import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetailCardComponent } from './plan-detail-card.component';

describe('PlanDetailCardComponent', () => {
  let component: PlanDetailCardComponent;
  let fixture: ComponentFixture<PlanDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanDetailCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
