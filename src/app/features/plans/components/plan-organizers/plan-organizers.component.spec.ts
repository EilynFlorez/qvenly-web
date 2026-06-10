import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanOrganizersComponent } from './plan-organizers.component';

describe('PlanOrganizersComponent', () => {
  let component: PlanOrganizersComponent;
  let fixture: ComponentFixture<PlanOrganizersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanOrganizersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanOrganizersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
