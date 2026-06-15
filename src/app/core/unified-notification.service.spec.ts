import { TestBed } from '@angular/core/testing';

import { UnifiedNotificationService } from './unified-notification.service';

describe('UnifiedNotificationService', () => {
  let service: UnifiedNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnifiedNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
