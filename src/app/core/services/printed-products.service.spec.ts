import { TestBed } from '@angular/core/testing';

import { PrintedProductsService } from './printed-products.service';

describe('PrintedProductsService', () => {
  let service: PrintedProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintedProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
