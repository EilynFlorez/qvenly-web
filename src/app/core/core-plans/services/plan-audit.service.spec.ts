import { TestBed } from '@angular/core/testing';

import { PlanAuditService } from './plan-audit.service';

describe('PlanAuditService', () => {
  let service: PlanAuditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanAuditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
