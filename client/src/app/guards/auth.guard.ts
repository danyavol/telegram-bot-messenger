import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private apiService: ApiService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.apiService.isAuthorized().pipe(
            tap((isAuthorized) => {
                if (!isAuthorized) {
                    this.router.navigate(['/auth']);
                }
            })
        );
    }

}
