import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParkingMap } from './parking-map';

describe('ParkingMap', () => {
  let component: ParkingMap;
  let fixture: ComponentFixture<ParkingMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingMap],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
