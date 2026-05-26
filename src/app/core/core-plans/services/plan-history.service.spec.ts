import { TestBed } from '@angular/core/testing';

import { PlanHistoryService } from './plan-history.service';

describe('PlanHistoryService', () => {
  let service: PlanHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
