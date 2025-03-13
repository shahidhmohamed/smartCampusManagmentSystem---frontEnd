import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from 'environments/environment.development';
@Injectable({ providedIn: 'root' })
export class RoleRedirectGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate(): boolean {
        const role = environment.role;

        console.log('🔍 Redirecting based on role:', role);

        let redirectPath = '/example'; // Default fallback

        if (role === 'ROLE_ADMIN') {
            redirectPath = '/admin/dashboard';
        } else if (role === 'ROLE_LECTURE') {
            redirectPath = '/lecture/dashboard';
        } else if (role === 'ROLE_STUDENT') {
            redirectPath = '/student/dashboard';
        }

        // ✅ Redirect and prevent further execution
        this.router.navigate([redirectPath]).then(() => {
            console.log('✅ Redirected to:', redirectPath);
        });

        return false; // ✅ Stops further processing
    }
}