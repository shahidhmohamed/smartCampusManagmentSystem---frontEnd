import { Routes } from '@angular/router';
import { TasksListComponent } from './admin-events/list/list.component';
import { FileManagerComponent } from './file-manager-2/file-manager/file-manager.component';
import { ResourceApprovalListComponent } from './resource-managment/resource-approval-list/resource-approval-list.component';
import { StudentAssessmentsComponent } from './student-assessments/student-assessments.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: StudentDashboardComponent },
    { path: 'assessment', component: StudentAssessmentsComponent },
    { path: 'file-manager', component: FileManagerComponent },
    { path: 'event-manager', component: TasksListComponent },
    { path: 'resourse', component: ResourceApprovalListComponent },
] as Routes;
