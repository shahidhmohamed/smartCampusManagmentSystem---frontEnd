import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { ClassScheduleService } from 'app/services/class-schedule/service/class-schedule.service';
import { ICourseRegistration } from 'app/services/course-registration/course-registration.model';
import { CourseRegistrationService } from 'app/services/course-registration/service/course-registration.service';
import { CourseService } from 'app/services/course/service/course.service';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { ResourceService } from 'app/services/resource/service/resource.service';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-student-assessments',
    standalone: true,
    imports: [
        TranslocoModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatTableModule,
        FullCalendarModule,
        CommonModule,
    ],
    templateUrl: './student-assessments.component.html',
    styleUrl: './student-assessments.component.scss',
})
export class StudentAssessmentsComponent implements OnInit {
    myCourses: ICourseRegistration[] = [];
    modules: IModule[] = [];
    selectedCourseId: string | null = null;
    selectedSemester: string | null = null;

    constructor(
        private _scheduleService: ClassScheduleService,
        private _courseRegisterService: CourseRegistrationService,
        private _courseService: CourseService,
        private _userService: UserManagementService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _moduleService: ModuleService,
        private _formBuilder: FormBuilder,
        private resourceService: ResourceService
    ) {}

    ngOnInit(): void {
        this.loadAllRegisterCourses();
    }

    /** Load all registered courses */
    loadAllRegisterCourses(): void {
        this._courseRegisterService
            .search({
                query: `studentId:${environment.user.id}`,
                size: 100,
                sort: ['asc'], // API-side sorting
            })
            .subscribe((res) => {
                this.myCourses = (res.body || []).map((course) => ({
                    ...course,
                    duration: course.duration ?? '0_SEMESTERS',
                }));
                console.log('My Courses:', this.myCourses);
                if (this.myCourses.length > 0) {
                    this.onCourseTabChange(0);
                }
            });
    }

    /** Extracts the number of semesters from duration and returns an array */
    getSemesters(duration: string | null): number[] {
        console.log('Processing Duration:', duration);
        if (!duration) return [];
        const match = duration.match(/^(\d+)_SEMESTERS$/);
        console.log('Match Found:', match);

        if (match) {
            const numSemesters = +match[1];

            // Generate semester labels
            const semesterLabels = this.generateSem(numSemesters);
            console.log('Generated Semester Labels:', semesterLabels);

            return Array.from({ length: numSemesters }, (_, i) => i + 1);
        }

        return [];
    }

    /** Generates semester labels */
    generateSem(numSemesters: number): string[] {
        return Array.from(
            { length: numSemesters },
            (_, i) => `SEMESTER_${i + 1}`
        );
    }

    /** Handle Course Tab Change */
    onCourseTabChange(index: number): void {
        if (this.myCourses.length > 0) {
            this.selectedCourseId = this.myCourses[index].courseId;

            // Generate semesters and check if they exist
            const semesters = this.generateSem(
                this.getSemesters(this.myCourses[index].duration).length
            );

            if (semesters.length > 0) {
                // Select first semester if available
                this.selectedSemester = semesters[0];
                console.log(
                    `Selected Course ID: ${this.selectedCourseId}, Default Semester: ${this.selectedSemester}`
                );

                // Load modules for the first semester
                this.loadModules(this.selectedCourseId, this.selectedSemester);
            } else {
                // No semesters, clear modules
                this.selectedSemester = null;
                this.modules = []; // Clear previous course's modules
                console.log(
                    `Selected Course ID: ${this.selectedCourseId}, No semesters found. Modules cleared.`
                );
            }
        }
    }

    /** Handle Semester Change (Triggered by mat-button-toggle-group) */
    onSemesterTabChange(courseIndex: number, semester: string): void {
        this.selectedSemester = semester;

        console.log(`Updated Semester Selected: ${this.selectedSemester}`);

        if (this.selectedCourseId && this.selectedSemester) {
            this.loadModules(this.selectedCourseId, this.selectedSemester);
        }
    }

    /** Load modules based on the selected course and semester */
    loadModules(courseId: string, semester: string | null): void {
        if (!semester) {
            console.warn('No semester selected, clearing modules.');
            this.modules = []; // Ensure modules are cleared when no semester exists
            return;
        }

        this._moduleService
            .search({
                query: `courseId:${courseId} AND semester:${semester}`, // Correct query format
                size: 100,
                sort: ['desc'],
            })
            .subscribe((res) => {
                if (res.body) {
                    console.log(
                        `Modules for Course ID ${courseId} and Semester ${semester}:`,
                        res.body
                    );
                    this.modules = res.body; // Update modules dynamically
                } else {
                    this.modules = []; // Clear modules if no data is returned
                }
            });
    }
}
