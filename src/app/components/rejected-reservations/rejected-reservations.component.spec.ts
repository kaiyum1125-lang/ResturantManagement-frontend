import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedReservationsComponent } from './rejected-reservations.component';

describe('RejectedReservationsComponent', () => {
  let component: RejectedReservationsComponent;
  let fixture: ComponentFixture<RejectedReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectedReservationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
