import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.isLoading).pipe(
        filter(isLoading => !isLoading),
        take(1),
        map(() =>
            authService.isAuthorized()
                ? true
                : router.createUrlTree(['/login'])
        )
    );
};