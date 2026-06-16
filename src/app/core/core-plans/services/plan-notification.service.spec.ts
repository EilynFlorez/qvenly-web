import { TestBed } from '@angular/core/testing';

import { PlanNotificationService } from './plan-notification.service';

describe('PlanNotificationService', () => {
  let service: PlanNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
