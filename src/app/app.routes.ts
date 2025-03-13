import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { AutoRedirectComponent } from './modules/auth/auto-redirect.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'signed-in-redirect' },

    // Redirect signed-in user dynamically based on role
    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        component: AutoRedirectComponent,
    },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () =>
                    import(
                        'app/modules/auth/confirmation-required/confirmation-required.routes'
                    ),
            },
            {
                path: 'forgot-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/forgot-password/forgot-password.routes'
                    ),
            },
            {
                path: 'reset-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/reset-password/reset-password.routes'
                    ),
            },
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.routes'),
            },
            {
                path: 'sign-up',
                loadChildren: () =>
                    import('app/modules/auth/sign-up/sign-up.routes'),
            },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-out',
                loadChildren: () =>
                    import('app/modules/auth/sign-out/sign-out.routes'),
            },
            {
                path: 'unlock-session',
                loadChildren: () =>
                    import(
                        'app/modules/auth/unlock-session/unlock-session.routes'
                    ),
            },
        ],
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'home',
                loadChildren: () =>
                    import('app/modules/landing/home/home.routes'),
            },
        ],
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            {
                path: 'example',
                loadChildren: () =>
                    import('app/modules/admin/example/example.routes'),
            },
            {
                path: 'admin',
                loadChildren: () => import('app/modules/admin/admin.routes'),
            },
            {
                path: 'student',
                loadChildren: () =>
                    import('app/modules/student/student.routes'),
            },
            {
                path: 'lecture',
                loadChildren: () =>
                    import('app/modules/lecture/lecture.routes'),
            },
        ],
    },

    // {
    //     path: 'student',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component: LayoutComponent,
    //     resolve: {
    //         initialData: initialDataResolver,
    //     },
    //     children: [
    //         {
    //             path: 'dashboard',
    //             loadChildren: () =>
    //                 import('app/modules/student/student.routes'),
    //         },
    //     ],
    // },

    // {
    //     path: '',
    //     component: LayoutComponent,
    //     resolve: { initialData: initialDataResolver },
    //     children: [
    //         {
    //             path: 'admin',

    //             data: { role: 'ROLE_ADMIN' },
    //             loadChildren: () =>
    //                 import('app/modules/admin/admin.routes').then(
    //                     (m) => m.adminRoutes
    //                 ),
    //         },
    //         {
    //             path: 'lecture',

    //             data: { role: 'ROLE_LECTURE' },
    //             loadChildren: () =>
    //                 import('app/modules/lecture/lecture.routes').then(
    //                     (m) => m.lectureRoutes
    //                 ),
    //         },
    //         {
    //             path: 'student',

    //             data: { role: 'ROLE_STUDENT' },
    //             loadChildren: () =>
    //                 import('app/modules/student/student.routes').then(
    //                     (m) => m.studentRoutes
    //                 ),
    //         },
    //     ],
    // },
];
