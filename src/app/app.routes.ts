import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'accounts/:id',
        loadComponent: () =>
            import('./pages/account-details/account-details')
            .then(m => m.AccountDetails)
    },
    {
        path: '',
        loadComponent: () => 
            import('./pages/dashboard/dashboard')
            .then(m => m.Dashboard)
    },
    {
        path: 'transactions',
        loadComponent: () => 
            import('./pages/transactions/transactions')
            .then(m => m.Transactions)
    }
];
