import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditFiltersComponent } from './audit-filters.component';

describe('AuditFiltersComponent', () => {
  let component: AuditFiltersComponent;
  let fixture: ComponentFixture<AuditFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
