import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { TasksListComponent } from './admin-events/list/list.component';
import { ChatsComponent } from './chat/chats/chats.component';
import { CourseDetailsComponent } from './course/course-details/course-details.component';
import { CourseManagementComponent } from './course/course-management/course-management.component';
import { ScheduleClassesComponent } from './course/schedule-classes/schedule-classes.component';
import { FileManagerComponent } from './file-manager-2/file-manager/file-manager.component';
import { ResourceManagment } from './resource-managment/list/list.component';
import { ResourceApprovalListComponent } from './resource-managment/resource-approval-list/resource-approval-list.component';
import { UserManagmentComponent } from './user-managment/user-managment.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'events', component: TasksListComponent },
    { path: 'resource-management', component: ResourceManagment },
    {
        path: 'resource-management-bookings-approval',
        component: ResourceApprovalListComponent,
    },
    { path: 'user-management', component: UserManagmentComponent },
    { path: 'file-manager-2', component: FileManagerComponent },
    { path: 'all-course', component: CourseDetailsComponent },
    { path: 'course-register', component: CourseManagementComponent },
    { path: 'class-schedule', component: ScheduleClassesComponent },
    { path: 'chat', component: ChatsComponent },
] as Routes;
