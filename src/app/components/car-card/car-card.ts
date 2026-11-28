import { Component, input } from '@angular/core';
import {Car} from '../../models/car'

@Component({
  imports: [],
  selector: 'app-car-card',
  styleUrl: './car-card.scss',
  templateUrl: './car-card.html',
})
export class CarCard {
  readonly car = input.required<Car>();
}
