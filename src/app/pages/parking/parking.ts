import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { ParkingMap } from '../../components/parking-map/parking-map';
import { CarService } from '../../services/car';
import { parkingZones } from '../../config/parking-layout';

@Component({
  imports: [ParkingMap],
  selector: 'app-parking',
  styleUrl: './parking.scss',
  templateUrl: './parking.html',
})
export class Parking implements OnInit {
  private readonly carService = inject(CarService);

  private readonly _selectedCarId = signal<string | null>(null);
  private readonly _parkingError = signal<string | null>(null);

  readonly parkingError = this._parkingError.asReadonly();
  readonly cars = this.carService.cars;
  readonly isLoading = this.carService.isLoading;
  readonly isSaving = this.carService.isSaving;

  readonly selectedCar = computed(() => {
    return this.cars().find(
      car => car.id === this._selectedCarId()
    ) ?? this.cars()[0] ?? null;
  });

  readonly selectedCarId = computed(() =>
    this.selectedCar()?.id ?? null
  );

  readonly error = computed(() =>
    this._parkingError() ?? this.carService.error()
  );

  ngOnInit(): void {
    this.carService.loadCars();
  }

  protected selectCar(carId: string): void{
    if(this.isSaving()) return;
    this._selectedCarId.set(carId);
    this._parkingError.set(null);
  }

  protected async onZoneSelected(zoneId: string): Promise<void>{
    const car = this.selectedCar();
    
    if(!car || this.isSaving() || this.isLoading()) return;

    const zone = parkingZones.find(
      zone => zone.id === zoneId
    );

    if(!zone) return;

    const isOccupied = this.cars().some(
      item => 
        item.id !== car.id &&
        item.parking_slot === zoneId
    );

    if (zone.type === 'single' && isOccupied){
      this._parkingError.set(
        'This parking space is already occupied'
      );
      return;
    }

    await this.saveParking(car.id, zoneId);
  }

  protected async removeParking(): Promise<void> {
      const car = this.selectedCar();

      if (!car || this.isSaving() || this.isLoading()) return;

      await this.saveParking(car.id, null);
  }

  protected async saveParking(
    carId: string,
    parkingSlot: string | null
  ) : Promise<void>{
    this._parkingError.set(null);

    try{
      await this.carService.updateParkingSlot(carId, parkingSlot);
    } catch (error) {
      this._parkingError.set(
        'Unable to update parking location.'
      );

      console.error(error);
    }
  }
}
