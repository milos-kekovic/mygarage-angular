import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => 
            import('./pages/login/login')
                .then(m => m.Login)
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => 
            import('./pages/dashboard/dashboard')
                .then(m => m.Dashboard)
    },
    {
        path: 'parking',
        canActivate: [authGuard],
        loadComponent: () => 
            import('./pages/parking/parking')
                .then(m => m.Parking)
    }
];
