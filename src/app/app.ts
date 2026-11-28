import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { CarService } from './services/car';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('My Garage');
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly carService = inject(CarService);

  async logout(): Promise<void>{
    try {
      await this.authService.signOut();
      this.carService.reset();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
}