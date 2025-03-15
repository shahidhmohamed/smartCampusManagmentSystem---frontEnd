import { Routes } from '@angular/router';
import { StudentAssessmentsComponent } from './student-assessments/student-assessments.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: StudentDashboardComponent },
    { path: 'assessment', component: StudentAssessmentsComponent },
] as Routes;
