import { Component, inject, OnInit } from '@angular/core';
import { Account } from '../../components/account/account';
import { AccountService } from '../../services/account';

@Component({
  selector: 'app-dashboard',
  imports: [Account],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard implements OnInit {
  private readonly accountService = inject(AccountService);

  protected readonly balance = this.accountService.balance;
  protected readonly canWithdraw = this.accountService.canWithdraw;
  protected readonly isLoading = this.accountService.isLoading;
  protected readonly error = this.accountService.error;

  ngOnInit(): void {
    this.accountService.loadAccount('1');
  }

  deposit(): void {
    this.accountService.deposit();
  }

  withdraw(): void {
    this.accountService.withdraw();
  }
}