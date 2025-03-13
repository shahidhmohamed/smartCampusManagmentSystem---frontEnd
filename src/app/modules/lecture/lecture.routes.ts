import { Routes } from '@angular/router';
import { LectureDashboardComponent } from './lecture-dashboard/lecture-dashboard.component';

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LectureDashboardComponent },
] as Routes;
