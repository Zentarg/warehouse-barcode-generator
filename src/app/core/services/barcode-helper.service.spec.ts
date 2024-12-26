import { TestBed } from '@angular/core/testing';

import { BarcodeHelperService } from './barcode-helper.service';

describe('BarcodeHelperService', () => {
  let service: BarcodeHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BarcodeHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
