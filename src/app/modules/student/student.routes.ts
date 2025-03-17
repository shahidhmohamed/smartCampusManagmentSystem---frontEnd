import { Routes } from '@angular/router';
import { TasksListComponent } from './admin-events/list/list.component';
import { FileManagerComponent } from './file-manager-2/file-manager/file-manager.component';
import { StudentAssessmentsComponent } from './student-assessments/student-assessments.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { ResourceManagment } from './resource-managment/list/list.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: StudentDashboardComponent },
    { path: 'assessment', component: StudentAssessmentsComponent },
    { path: 'file-manager', component: FileManagerComponent },
    { path: 'event-manager', component: TasksListComponent },
    { path: 'resourse', component: ResourceManagment },
] as Routes;
