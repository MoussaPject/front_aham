import { TestBed } from '@angular/core/testing';

import { FavorisServiceService } from './favoris-service.service';

describe('FavorisServiceService', () => {
  let service: FavorisServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavorisServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
