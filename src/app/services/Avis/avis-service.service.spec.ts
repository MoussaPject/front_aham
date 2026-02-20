import { TestBed } from '@angular/core/testing';

import { AvisServiceService } from './avis-service.service';

describe('AvisServiceService', () => {
  let service: AvisServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvisServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
