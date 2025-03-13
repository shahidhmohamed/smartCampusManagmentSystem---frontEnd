import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { TasksListComponent } from './admin-events/list/list.component';

import { ResourceManagment } from './resource-managment/list/list.component';
import { ResourceApprovalComponent } from './resource-managment/resource-approval/resource-approval.component';
import { UserManagmentComponent } from './user-managment/user-managment.component';
import { FileManagerComponent } from './file-manager-2/file-manager/file-manager.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'events', component: TasksListComponent },
    { path: 'resource-management', component: ResourceManagment },
    {
        path: 'resource-management-bookings',
        component: ResourceApprovalComponent,
    },
    { path: 'user-management', component: UserManagmentComponent },
    // {
    //     path: 'file-manager',
    //     loadChildren: () =>
    //         import('app/modules/admin/file-manager/file-manager.routes'),
    // },
    { path: 'file-manager-2', component: FileManagerComponent },
] as Routes;
