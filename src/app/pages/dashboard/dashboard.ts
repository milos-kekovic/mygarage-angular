import { Component, OnInit, inject, signal } from '@angular/core';
import { CarService } from '../../services/car';
import { AuthService } from '../../services/auth';
import { Car } from '../../models/car';
import { CarCard } from '../../components/car-card/car-card';

@Component({
  selector: 'app-dashboard',
  imports: [CarCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private readonly carService = inject(CarService);

  readonly cars = this.carService.cars;
  readonly isLoading = this.carService.isLoading;
  readonly error = this.carService.error;

  ngOnInit(): void {
    this.carService.loadCars();
  }

  protected onViewDetails(carId: string): void {
    console.log('Selected car ID:', carId);
  }
}