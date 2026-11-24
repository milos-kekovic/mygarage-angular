import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-account',
  styleUrl: './account.scss',
  templateUrl: './account.html',
})
export class Account {
  readonly balance = input.required<number>();
  readonly canWithdraw = input.required<boolean>();
  readonly isLoading = input.required<boolean>();
  readonly error = input.required<string | null>();
  readonly depositRequest = output<void>();
  readonly withdrawRequest = output<void>();
}
