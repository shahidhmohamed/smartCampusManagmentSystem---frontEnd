import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import {
    catchError,
    map,
    Observable,
    of,
    switchMap,
    tap,
    throwError,
} from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { User } from '../user/user.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUser: any;
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _navigationService = inject(NavigationService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    getUserRole(): string {
        return environment.role;
    }

    getUserRoleLocal(): string {
        return localStorage.getItem('userRole') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    check2(): Observable<boolean> {
        // if (this._authenticated) {
        //     // If already authenticated, return true directly
        //     return of(true);
        //   }

        if (this._authenticated) {
            return of(true);
        }
        // return of(false)
        if (!this.accessToken) {
            return of(false);
        }

        return this._httpClient.get<User>('/api/account').pipe(
            tap((authenticated) => (this._authenticated = !!authenticated)), // Update authentication status
            map((u) => {
                environment.user = {
                    ...u,
                    name: u.firstName + ' ' + u.lastName,
                };
                this._userService.user = {
                    ...u,
                    name: u.firstName + ' ' + u.lastName,
                    avatar: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fuxwing.com%2Fuser-male-icon%2F&psig=AOvVaw0dPJ_ilh6drI1SuuJzVwz8&ust=1740913877119000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMDe297f6IsDFQAAAAAdAAAAABAE',
                };

                // var BB = u.authorities.find((a) => a.startsWith('ROLE_ADMIN'));

                var userRoles = u.authorities;

                if (userRoles.includes('ROLE_ADMIN')) {
                    environment.role = 'ROLE_ADMIN';
                } else if (userRoles.includes('ROLE_LECTURE')) {
                    environment.role = 'ROLE_LECTURE';
                } else if (userRoles.includes('ROLE_STUDENT')) {
                    environment.role = 'ROLE_STUDENT';
                }

                console.log('User role Authservice', environment.role);

                this._navigationService.get().subscribe();

                return !!u;
            }), // Check for access token after request
            catchError((e) => {
                if (e.status === 401) {
                    this.signOut();
                    // return this.signInUsingToken();
                }
                return of(false);
            }) // Handle errors and return false
        );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // credentials.username = credentials.email
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('api/authenticate', credentials).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.id_token;

                return this.signInUsingToken().pipe(
                    map((signInUsingTokenResponse: any) => {
                        // Merge the responses if needed
                        return {
                            signInResponse: response,
                            signInUsingTokenResponse,
                        };
                    })
                );
            })
        );
    }

    getCurrentUser(): any {
        return this.currentUser || JSON.parse(localStorage.getItem('user'));
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .get<User>('api/account', {
                headers: { Authorization: `Bearer ${this.accessToken}` },
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
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

    /**
     * Sign up
     *
     * @param user
     */
    signUp(User: {
        login: string;
        firstName: string;
        lastName: string;
        activated: boolean;
        authorities: string[];
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/register', User);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    getUserData(): Observable<any> {
        const userId = this._userService.user.id; // Assuming you store user ID in userService

        return this._httpClient.get(`api/user/${userId}/data`, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
    }
}
