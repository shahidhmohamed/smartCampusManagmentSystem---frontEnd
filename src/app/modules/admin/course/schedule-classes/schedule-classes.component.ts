import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    IClassSchedule,
    NewClassSchedule,
} from 'app/services/class-schedule/class-schedule.model';
import { ClassScheduleService } from 'app/services/class-schedule/service/class-schedule.service';
import { ICourse } from 'app/services/course/course.model';
import { CourseService } from 'app/services/course/service/course.service';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-schedule-classes',
    standalone: true,
    imports: [
        MatTableModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelect,
        MatOptionModule,
        MatDatepickerModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatAutocompleteModule,
    ],
    templateUrl: './schedule-classes.component.html',
    styleUrl: './schedule-classes.component.scss',
})
export class ScheduleClassesComponent implements OnInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    searchText = new FormControl('');
    createForm: boolean = false;

    displayedColumns: string[] = [
        'course',
        'module',
        'instructor',
        'scheduleDate',
        'scheduleDateFrom',
        'scheduleDateTo',
        'location',
        'Action',
    ];

    scheduleForm: UntypedFormGroup;
    dataSource = new MatTableDataSource<IClassSchedule>();

    coursesControl = new FormControl();
    filteredCourses$: Observable<ICourse[]>;
    allCourses: ICourse[] = [];

    instructorControl = new FormControl();
    filteredinstructor$: Observable<IUser[]>;
    allinstructor: IUser[] = [];

    modules: IModule[] = [];
    allModules: IModule[] = [];

    campusResources: IResource[] = [];
    resourceControl = new FormControl();
    filteredResource$: Observable<IResource[]>;

    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    constructor(
        private _courseService: CourseService,
        private _userService: UserManagementService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _scheduleService: ClassScheduleService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _moduleService: ModuleService,
        private _formBuilder: FormBuilder,
        private resourceService: ResourceService
    ) {}

    ngOnInit(): void {
        this.scheduleForm = this._formBuilder.group({
            id: [''],
            courseId: [''],
            moduleId: [''],
            instructorId: [''],
            scheduleDate: [''],
            scheduleTimeFrom: [''],
            scheduleTimeTo: [''],
            location: [''],
        });

        this.loadStaffAndCourses();
        this.loadSchedules();

        this.filteredCourses$ = this.coursesControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.courseName?.toLowerCase() || ''
            ),
            map((name) => this.filterCourses(name))
        );

        this.filteredinstructor$ = this.instructorControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.firstName?.toLowerCase() || ''
            ),
            map((name) => this.filterInstructor(name))
        );

        this.filteredResource$ = this.resourceControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string' ? value : value?.name || ''
            ),
            map((name) => this.filterResource(name))
        );
    }

    /** Load All Schedules */
    loadSchedules(): void {
        this._scheduleService.query().subscribe((res) => {
            this.dataSource.data = res.body || [];
        });
    }

    /** Load Courses and Instructors */
    loadStaffAndCourses(): void {
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

    /** Load Modules when Course is Selected */
    loadModulesForCourse(courseId: string): void {
        this._moduleService
            .search({
                query: `courseId:${courseId}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((res) => {
                this.modules = res.body;
            });
    }

    /** Filter Courses */
    filterCourses(name: string): ICourse[] {
        if (!name) return this.allCourses;
        const filterValue = name.toLowerCase();
        return this.allCourses.filter(
            (resource) =>
                resource.courseName?.toLowerCase().includes(filterValue) ||
                resource.courseCode?.toLowerCase().includes(filterValue)
        );
    }

    /** On Course Selection */
    onSelectCourse(event: any): void {
        const selectedCourse: ICourse = event.option.value;
        if (selectedCourse) {
            this.scheduleForm.patchValue({ courseId: selectedCourse.id });
            this.loadModulesForCourse(selectedCourse.id);
        }
    }

    /** Display Course Name */
    displayCourseName(course: ICourse): string {
        return course && course.courseName
            ? `${course.courseCode} ${course.courseName || ''}`
            : '';
    }

    /** Filter Instructors */
    filterInstructor(name: string): IUser[] {
        if (!name) return this.allinstructor;
        const filterValue = name.toLowerCase();
        return this.allinstructor.filter(
            (instructor) =>
                instructor.firstName?.toLowerCase().includes(filterValue) ||
                instructor.lastName?.toLowerCase().includes(filterValue) ||
                instructor.login?.toLowerCase().includes(filterValue) ||
                instructor.id?.toLowerCase().includes(filterValue)
        );
    }

    /** On Instructor Selection */
    onSelectInstructor(event: any): void {
        const selectedInstructor: IUser = event.option.value;
        console.log(selectedInstructor);
        if (selectedInstructor) {
            this.scheduleForm.patchValue({
                instructorId: selectedInstructor.id,
            });
        }
    }

    /** Display Instructor Name */
    displayInstructorName(instructor: IUser): string {
        return instructor
            ? `${instructor.firstName} ${instructor.lastName || ''}`
            : '';
    }

    filterResource(name: string): IResource[] {
        const filterValue = name.toLowerCase();

        return this.campusResources
            .filter((resource) => resource.availability)
            .filter(
                (resource) =>
                    resource.name?.toLowerCase().includes(filterValue) ||
                    resource.resourceType?.toLowerCase().includes(filterValue)
            );
    }

    onResourceSelect(event: any) {
        const selectedResource: IResource = event.option.value;
        if (selectedResource) {
            this.scheduleForm.patchValue({
                location: selectedResource.id,
            });
        }
        this._changeDetectorRef.detectChanges();
    }

    displayResource(resource: IResource | null): string {
        return resource
            ? `${resource.name} ${resource.resourceType || ''}`
            : '';
    }

    /** Toggle Form */
    toggleForm(): void {
        this.resetForm();
        this.createForm = !this.createForm;
    }

    /** Reset Form */
    resetForm(): void {
        this.createForm = false;
        this.scheduleForm.reset();
        this.coursesControl.setValue('');
        this.instructorControl.setValue('');
    }

    /** Save Schedule (Create/Update) */
    saveSchedule(): void {
        if (this.scheduleForm.invalid) {
            return;
        }

        const scheduleData: IClassSchedule = this.scheduleForm.value;

        if (scheduleData.id) {
            // Update existing schedule
            this._scheduleService.update(scheduleData).subscribe(() => {
                this.loadSchedules();
                this.createForm = false;
                this.resetForm();
            });
        } else {
            // Create new schedule
            const newSchedule: NewClassSchedule = { ...scheduleData, id: null };
            this._scheduleService.create(newSchedule).subscribe(() => {
                this.loadSchedules();
                this.resetForm();
            });
        }
    }

    /** Edit Schedule */
    editSchedule(schedule: IClassSchedule): void {
        this.createForm = true;
        this.scheduleForm.patchValue(schedule);
        const selectedCourse = this.allCourses.find(
            (c) => c.id === schedule.courseId
        );
        if (selectedCourse) {
            this.coursesControl.setValue(selectedCourse);
        } else {
            console.warn('Course not found for ID:', schedule.courseId);
        }

        // Set Full Student Object for Mat-Autocomplete
        const selectedInstructure = this.allinstructor.find(
            (s) => s.id === schedule.instructorId
        );
        if (selectedInstructure) {
            this.instructorControl.setValue(selectedInstructure);
        } else {
            console.warn('Student not found for ID:', schedule.instructorId);
        }

        const selectedLocation = this.campusResources.find(
            (s) => s.id === schedule.location
        );
        if (selectedLocation) {
            this.resourceControl.setValue(selectedLocation);
            console.log(selectedLocation);
        } else {
            console.warn(
                'Student not found for IDddddddddddddd:',
                schedule.location
            );
        }

        this._moduleService
            .search({
                query: `courseId:${schedule.courseId}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((res) => {
                if (res.body) {
                    const selectedModule = res.body.find(
                        (m) => m.id === schedule.moduleId
                    );
                    if (selectedModule) {
                        this.scheduleForm.patchValue({
                            moduleId: selectedModule.id,
                        });

                        this.scheduleForm.controls[
                            'moduleId'
                        ].updateValueAndValidity();

                        console.warn('Updated Module ID:', selectedModule.id);
                    } else {
                        console.warn(
                            'Module not found for ID:',
                            schedule.moduleId
                        );
                    }
                } else {
                    console.warn(
                        'No modules found for Course ID:',
                        schedule.courseId
                    );
                }
            });
    }

    /** Delete Schedule */
    deleteSchedule(schedule: IClassSchedule): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Schedule',
            message: `Are you sure you want to delete this schedule?`,
            actions: { confirm: { label: 'Yes' }, cancel: { label: 'No' } },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._scheduleService.delete(schedule.id).subscribe(() => {
                    this.loadSchedules();
                });
            }
        });
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
