import { Routes } from '@angular/router';
import { LectureAssignmentComponent } from './lecture-assignment/lecture-assignment.component';
import { LectureDashboardComponent } from './lecture-dashboard/lecture-dashboard.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LectureDashboardComponent },
    { path: 'assessment', component: LectureAssignmentComponent },
] as Routes;
