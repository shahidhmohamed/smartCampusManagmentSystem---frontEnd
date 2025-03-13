import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'app-auto-redirect',
    standalone: true,
    template: '',
})
export class AutoRedirectComponent implements OnInit {
    constructor(private router: Router) {}
    private _userService = inject(UserService);
    private _authService = inject(AuthService);
    user: User;

    ngOnInit(): void {
        // const role = environment.role;
        const role = this._authService.getUserRoleLocal();

        console.log('USER ROLE LOCAL: ', role);

        if (role === 'ROLE_ADMIN') {
            this.router.navigate(['admin/dashboard']);
        } else if (role === 'ROLE_LECTURE') {
            this.router.navigate(['lecture/dashboard']);
        } else if (role === 'ROLE_STUDENT') {
            this.router.navigate(['student/dashboard']);
        } else {
            this.router.navigate(['/sign-in']);
        }
    }
}
