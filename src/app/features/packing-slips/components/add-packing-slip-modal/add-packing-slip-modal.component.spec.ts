import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPackingSlipModalComponent } from './add-packing-slip-modal.component';

describe('AddPackingSlipModalComponent', () => {
  let component: AddPackingSlipModalComponent;
  let fixture: ComponentFixture<AddPackingSlipModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPackingSlipModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPackingSlipModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
