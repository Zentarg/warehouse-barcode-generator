import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePrinterModalComponent } from './choose-printer-modal.component';

describe('ChoosePrinterModalComponent', () => {
  let component: ChoosePrinterModalComponent;
  let fixture: ComponentFixture<ChoosePrinterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoosePrinterModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoosePrinterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
