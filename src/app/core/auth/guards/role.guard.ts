import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { environment } from 'environments/environment.development';
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const expectedRole = route.data?.['role'];
        const currentRole = environment.role;

        if (currentRole === expectedRole) {
            return true;
        }

        console.warn('Unauthorized access. Redirecting...');
        this.router.navigate(['/signed-in-redirect']); // Redirect to sign-in or another appropriate page
        return false;
    }
}
