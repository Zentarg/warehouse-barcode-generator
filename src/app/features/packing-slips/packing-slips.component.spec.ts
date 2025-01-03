import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingSlipsComponent } from './packing-slips.component';

describe('PackingSlipsComponent', () => {
  let component: PackingSlipsComponent;
  let fixture: ComponentFixture<PackingSlipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackingSlipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingSlipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
