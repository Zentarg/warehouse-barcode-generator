import { TestBed } from '@angular/core/testing';

import { PackingSlipsService } from './packing-slips.service';

describe('PackingSlipsService', () => {
  let service: PackingSlipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackingSlipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
