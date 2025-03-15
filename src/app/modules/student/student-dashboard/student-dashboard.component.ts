import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { IClassSchedule } from 'app/services/class-schedule/class-schedule.model';
import { ClassScheduleService } from 'app/services/class-schedule/service/class-schedule.service';
import { ICourseRegistration } from 'app/services/course-registration/course-registration.model';
import { CourseRegistrationService } from 'app/services/course-registration/service/course-registration.service';
import { ICourse } from 'app/services/course/course.model';
import { CourseService } from 'app/services/course/service/course.service';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-student-dashboard',
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
    templateUrl: './student-dashboard.component.html',
    styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
    user: IUser = environment.user;
    dataSource = new MatTableDataSource<IClassSchedule>();
    myCourses: ICourseRegistration[] = [];
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin],
        events: [],
    };

    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    allCourses: ICourse[] = [];

    allinstructor: IUser[] = [];
    allModules: IModule[] = [];
    campusResources: IResource[] = [];

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
        this.loadAll();
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
                this.myCourses = res.body || [];
                console.log('My Courses', this.myCourses);

                if (this.myCourses.length) {
                    // Fetch schedules for all courses
                    this.loadSchedules();
                }
            });
    }

    loadAll(): void {
        this._courseService
            .query()
            .subscribe((res: HttpResponse<ICourse[]>) => {
                if (res.body) {
                    this.allCourses = res.body;
                    this.pagination.length = res.body.length;
                    this._changeDetectorRef.detectChanges();
                }
            });

        this._userService.query().subscribe((response) => {
            if (response.body) {
                this.allinstructor = response.body.filter((user) =>
                    user.authorities?.includes('ROLE_LECTURE')
                );
            }
        });

        this._moduleService.query().subscribe((res) => {
            this.allModules = res.body;
        });

        this.resourceService.query().subscribe((response) => {
            let resources = response.body || [];

            resources = resources.filter(
                (res) => res.resourceType === 'ROOM' || 'COMPUTER_LAB'
            );
            this.campusResources = resources;
        });
    }

    /** Load all schedules based on registered courses */
    loadSchedules(): void {
        const courseIds = this.myCourses
            .map((course) => course.courseId)
            .join(' OR ');

        if (!courseIds) return; // Prevent empty query execution

        this._scheduleService
            .search({
                query: `courseId:${courseIds}`,
                size: 100,
                sort: ['asc'], // API-side sorting
            })
            .subscribe((res) => {
                console.log('Raw API Response:', res.body); // Debugging

                if (!res.body || res.body.length === 0) {
                    console.warn('No schedules found');
                    this.dataSource.data = [];
                    return;
                }

                const now = new Date().getTime(); // Current timestamp

                this.dataSource.data = res.body
                    .filter(
                        (schedule) =>
                            schedule.scheduleDate && schedule.scheduleTimeFrom
                    ) // Ensure valid data
                    .map((schedule) => {
                        const scheduleTimestamp = new Date(
                            `${schedule.scheduleDate}T${schedule.scheduleTimeFrom}:00`
                        ).getTime();
                        return { ...schedule, scheduleTimestamp }; // Attach timestamp for sorting
                    })
                    .filter((schedule) => schedule.scheduleTimestamp >= now) // Remove past schedules
                    .sort((a, b) => a.scheduleTimestamp - b.scheduleTimestamp); // Nearest first

                console.log('Sorted Upcoming Schedule:', this.dataSource.data);
            });
    }

    getFormattedTime(time: string): string {
        if (!time) return 'Invalid Time';
        const [hours, minutes] = time.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    getCourseName(courseId: string | undefined | null): string {
        if (!courseId) return 'Unknown Course';
        const course = this.allCourses.find((res) => res.id === courseId);
        return course ? course.courseName : 'Unknown Course';
    }

    getInstructorName(instructorId: string | undefined | null): string {
        if (!instructorId) return 'Unknown Instructor';
        const instructor = this.allinstructor.find(
            (res) => res.id === instructorId
        );
        return instructor
            ? `${instructor.firstName} ${instructor.lastName || ''}`
            : 'Unknown Instructor';
    }

    getModuleName(moduleId: string | undefined | null): string {
        if (!moduleId) return 'Unknown Module';
        const module = this.allModules.find((res) => res.id === moduleId);
        return module ? module.moduleName : 'Unknown Module';
    }

    getLocationName(locationId: string | undefined | null): string {
        if (!locationId) return 'Unknown Location';
        const location = this.campusResources.find(
            (res) => res.id === locationId
        );
        return location ? location.name : 'Unknown Location';
    }
}
