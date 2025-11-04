import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarMarker } from './car-marker';

describe('CarMarker', () => {
  let component: CarMarker;
  let fixture: ComponentFixture<CarMarker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarMarker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarMarker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
