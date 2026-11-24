import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountService } from '../../services/account';
import { AccountModel } from '../../models/account.model';
import { switchMap, filter, tap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.html',
  styleUrl: './account-details.scss',
})
export class AccountDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly accountService = inject(AccountService);

  protected readonly accountId = this.route.snapshot.paramMap.get('id');

  protected readonly account = signal<AccountModel | null>(null);

  constructor() {
    if (!this.accountId) {
      return;
    }

    // With Error Recovery
    this.route.paramMap
      .pipe(
        tap(() => this.account.set(null)),
        filter((params) => params.has('id')),
        switchMap((params) => {
          const id = params.get('id')!;

          return this.accountService.getAccount(id).pipe(
            catchError((error) => {
              console.error('Error', error);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (account) => {
          this.account.set(account);
        },
        error: (error) => {
          console.error('Failed to load account:', error);
        },
      });
  }
}
