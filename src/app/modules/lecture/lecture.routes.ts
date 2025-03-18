import { Routes } from '@angular/router';
import { ResourceManagment } from '../admin/resource-managment/list/list.component';
import { LectureAssignmentSubmitionsComponent } from './lecture-assignment-submitions/lecture-assignment-submitions.component';
import { LectureAssignmentComponent } from './lecture-assignment/lecture-assignment.component';
import { LectureDashboardComponent } from './lecture-dashboard/lecture-dashboard.component';
import { ResourceApprovalListComponent } from './resource-managment/resource-approval-list/resource-approval-list.component';
import { TasksListComponent } from './admin-events/list/list.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LectureDashboardComponent },
    { path: 'assessment', component: LectureAssignmentComponent },
    {
        path: 'submissions/:id',
        component: LectureAssignmentSubmitionsComponent,
    },
    { path: 'event-manager', component: TasksListComponent },
    { path: 'resourse', component: ResourceApprovalListComponent },
] as Routes;
