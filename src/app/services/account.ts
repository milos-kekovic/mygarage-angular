import { Service, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountModel } from '../models/account.model';
import { Observable, finalize } from 'rxjs';

@Service()
export class AccountService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/accounts';

  private readonly _balance = signal(1000);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly balance = this._balance.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  getAccount(id: string): Observable<AccountModel>{
    return this.http.get<AccountModel>(
      `${this.apiUrl}/${id}`
    )
  }

  updateBalance(
    id: string,
    balance: number
  ): Observable<AccountModel> {
    return this.http.patch<AccountModel>(
      `${this.apiUrl}/${id}`,
      {balance}
    );
  }

  loadAccount(id: string): void {
    this.getAccount(id).subscribe({
      next: account => {
        this._balance.set(account.balance);
      },
      error: error => {
        console.error('Failed to load account:', error);
      }
    })
  }

  readonly canWithdraw = computed (
    () => this._balance() >= 100
  );

  deposit(): void {
    if(this._isLoading()){
      return;
    }

    this._error.set(null);
    this._isLoading.set(true);

    const newBalance = this._balance() + 100;

    this.updateBalance('999', newBalance)
    .pipe(
      finalize(() =>{
        this._isLoading.set(false);
      })
    )
    .subscribe({
      next: account => {
        this._balance.set(account.balance);
      },
      error: error => {
        console.error('Deposit failed:', error);

        this._error.set(
          'Transaction failed. Please try again.'
        );
      }      
    });
  }

  withdraw () {
    if(!this.canWithdraw() || this._isLoading()){
      return;
    }
    const newBalance = this._balance() - 100;

    this.updateBalance('1', newBalance)
    .pipe(
      finalize(
        () => {this._isLoading.set(false);}
      )
    )
    .subscribe({
      next: account => {
        this._balance.set(account.balance);
      },
      error: error => {
        console.error('Withdraw failed:', error)
      }
    })
  }

}
