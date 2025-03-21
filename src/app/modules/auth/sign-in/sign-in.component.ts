import { HttpClient } from '@angular/common/http';
import {
    Component,
    inject,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    searchQuery$: BehaviorSubject<string> = new BehaviorSubject(null);
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    private _userService = inject(UserService);
    private _httpClient = inject(HttpClient);
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _navigationService: NavigationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
            rememberMe: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            (response: any) => {
                // Fetch navigation data
                this._navigationService.get().subscribe();

                // Fetch user details after login
                this._httpClient
                    .get<User>('http://100.88.28.94:8080/api/account')
                    .pipe(
                        map((u) => {
                            console.log('User Data:', u);

                            this._userService.user = u;

                            const userData = {
                                ...u,
                                name: `${u.firstName} ${u.lastName}`,
                                avatar: 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/default-avatar-profile-picture-male-icon.png',
                            };
                            this._userService.user = userData;
                            var userRoles = u.authorities;
                            environment.user = u;

                            let role = '';
                            let redirectURL = '/sign-in'; // Default redirect if no role found

                            if (userRoles.includes('ROLE_ADMIN')) {
                                role = 'ROLE_ADMIN';
                                redirectURL = '/admin/dashboard';
                            } else if (userRoles.includes('ROLE_LECTURE')) {
                                role = 'ROLE_LECTURE';
                                redirectURL = '/lecture/dashboard';
                            } else if (userRoles.includes('ROLE_STUDENT')) {
                                role = 'ROLE_STUDENT';
                                redirectURL = '/student/dashboard';
                            }

                            // Save role in localStorage for persistence
                            localStorage.setItem('userRole', role);
                            environment.role = role;

                            this._navigationService.get().subscribe();

                            console.log('User role login:', role);
                            console.log('Redirecting to:', redirectURL);

                            return redirectURL;
                        }),
                        catchError((e) => {
                            console.error('Error fetching user account:', e);
                            if (e.status === 401) {
                                this.signOut();
                            }
                            return of('/sign-in'); // Fallback
                        })
                    )
                    .subscribe((redirectURL) => {
                        // Load user-specific data before navigating
                        this.loadUserSpecificData();

                        // Ensure role is set before navigating
                        setTimeout(() => {
                            this._router.navigateByUrl(redirectURL);
                        }, 100);
                    });

                console.log('Login Response:', response);
            },
            (error) => {
                console.error('Login failed:', error);

                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Wrong email or password',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }

    private loadUserSpecificData(): void {
        const user = this._authService.getCurrentUser();
        if (user) {
            // Assuming you have a service to fetch user-specific data
            // Call your service method to fetch data based on user ID
            // Example: this._userService.getUserData(user.id).subscribe(...);
        }
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }
}
