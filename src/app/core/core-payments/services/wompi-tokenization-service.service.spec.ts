import { TestBed } from '@angular/core/testing';

import { WompiTokenizationServiceService } from './wompi-tokenization-service.service';

describe('WompiTokenizationServiceService', () => {
  let service: WompiTokenizationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WompiTokenizationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
