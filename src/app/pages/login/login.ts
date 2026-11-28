import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly router = inject(Router);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  protected async onSubmit(): Promise<void>{
    if(this.loginForm.invalid || this.isLoading()){
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try{
      const {email, password} = this.loginForm.getRawValue();
      await this.authService.signIn(email, password);
      await this.router.navigate(['/']);
    } catch (error){
      this.error.set(
        error instanceof Error ? error.message : 'Error occures while login atempt'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
