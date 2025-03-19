import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    IAttendenceStudentsRecord,
    NewAttendenceStudentsRecord,
} from 'app/services/attendence-students-record/attendence-students-record.model';
import { AttendenceStudentsRecordService } from 'app/services/attendence-students-record/service/attendence-students-record.service';
import { NewAttendence } from 'app/services/attendence/attendence.model';
import { AttendenceService } from 'app/services/attendence/service/attendence.service';
import { IClassSchedule } from 'app/services/class-schedule/class-schedule.model';
import { ClassScheduleService } from 'app/services/class-schedule/service/class-schedule.service';
import { ICourseRegistration } from 'app/services/course-registration/course-registration.model';
import { CourseRegistrationService } from 'app/services/course-registration/service/course-registration.service';
import { ICourse } from 'app/services/course/course.model';
import { CourseService } from 'app/services/course/service/course.service';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { IUser, User } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-student-attendence',
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
        MatCheckboxModule,
    ],
    templateUrl: './student-attendence.component.html',
    styleUrl: './student-attendence.component.scss',
})
export class StudentAttendenceComponent implements OnInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    searchText = new FormControl('');
    createForm: boolean = false;
    dataSource = new MatTableDataSource<IAttendenceStudentsRecord>();
    displayedColumns: string[] = ['Student', 'Attendance'];
    user: User = environment.user;
    myCourses: ICourseRegistration[] = [];
    classSchedule: IClassSchedule[] = [];
    coursesControl = new FormControl();
    attendenceForm: UntypedFormGroup;
    courseForm: UntypedFormGroup;
    filteredCourses$: Observable<ICourse[]>;
    allCourses: ICourse[] = [];
    allinstructor: IUser[] = [];
    modules: IModule[] = [];
    allModules: IModule[] = [];
    allStudents: IUser[] = [];

    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };
    constructor(
        private _courseRegisterService: CourseRegistrationService,
        private _scheduleService: ClassScheduleService,
        private _userService: UserManagementService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _moduleService: ModuleService,
        private _formBuilder: FormBuilder,
        private _courseService: CourseService,
        private _AttendenceStudentsRecordService: AttendenceStudentsRecordService,
        private _AttendenceService: AttendenceService
    ) {}
    ngOnInit(): void {
        this.attendenceForm = this._formBuilder.group({
            id: [''],
            courseId: ['', Validators.required],
            moduleId: ['', Validators.required],
        });

        this.courseForm = this._formBuilder.group({
            courseId: [''],
            moduleId: [''],
            courseName: [''],
            moduleName: [''],
            instructorId: [''],
            instructorName: [''],
            createdAt: [''],
        });

        this.loadAll();
        this.filteredCourses$ = this.coursesControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.courseName?.toLowerCase() || ''
            ),
            map((name) => this.filterCourses(name))
        );
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
                this.allinstructor = response.body;
            }
        });

        this._moduleService.query().subscribe((res) => {
            this.allModules = res.body;
        });

        this._userService.query().subscribe((response) => {
            if (response.body) {
                this.allStudents = response.body.filter((user) =>
                    user.authorities?.includes('ROLE_STUDENT')
                );
            }
        });
    }

    filterCourses(name: string): ICourse[] {
        if (!name) return this.allCourses;
        const filterValue = name.toLowerCase();
        return this.allCourses.filter(
            (resource) =>
                resource.courseName?.toLowerCase().includes(filterValue) ||
                resource.courseCode?.toLowerCase().includes(filterValue)
        );
    }

    displayCourseName(course: ICourse): string {
        return course ? `${course.courseCode} - ${course.courseName}` : '';
    }

    onSelectCourse(event: any) {
        const selectedCourse: ICourse = event.option.value;
        if (selectedCourse) {
            this.courseForm.patchValue({
                courseId: selectedCourse.id,
                courseName: selectedCourse.courseName,
            });
            this.loadModulesForCourse(selectedCourse.id);
        }
    }

    onSelectModule(event: any) {
        const selectedModule: IModule = event.value; // Correct way for mat-select
        if (selectedModule) {
            const courseId =
                selectedModule.courseId || this.attendenceForm.value.courseId;

            if (!courseId) {
                console.warn('Course ID not found for selected module.');
                return;
            }

            this.courseForm.patchValue({
                moduleId: selectedModule.id,
                moduleName: selectedModule.moduleName,
            });

            this._courseRegisterService
                .search({
                    query: `courseId:${courseId}`,
                    size: 1000,
                    sort: ['asc'],
                })
                .subscribe((res) => {
                    if (res.body) {
                        // Create attendance records for students with default 'isPresent' as false
                        this.dataSource.data = res.body.map((student) => ({
                            id: null,
                            isPresent: false,
                            studentName: this.getStudentName(student.studentId),
                        }));
                    } else {
                        this.dataSource.data = [];
                    }

                    console.log(
                        'Loaded registered students:',
                        this.dataSource.data
                    );
                    this._changeDetectorRef.detectChanges();
                });
        }
    }

    loadModulesForCourse(courseId: string): void {
        this._moduleService
            .search({
                query: `courseId:${courseId}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((res) => {
                this.modules = res.body || [];
            });
    }

    toggleForm(): void {
        this.createForm = !this.createForm;
    }

    resetForm(): void {
        this.createForm = false;
        // this.attendenceForm.reset();
        this.coursesControl.setValue('');
        this.courseForm.reset();
        this.createForm = false;
        this.dataSource.data = [];
        this.modules = [];
    }

    getCourseName(courseId: string | undefined | null): string {
        if (!courseId) return 'Unknown Course';
        const course = this.allCourses.find((res) => res.id === courseId);
        return course ? course.courseName : 'Unknown Course';
    }

    getModuleName(moduleId: string | undefined | null): string {
        if (!moduleId) return 'Unknown Module';
        const module = this.allModules.find((res) => res.id === moduleId);
        return module ? module.moduleName : 'Unknown Module';
    }

    getStudentName(studentId: string | undefined | null): string {
        if (!studentId) return 'Unknown Student'; // Handles undefined/null case
        const student = this.allStudents.find((res) => res.id === studentId);
        return student
            ? `${student.firstName} ${student.lastName}`
            : 'Unknown Student';
    }

    submitAttendance() {
        const attendance: NewAttendence = {
            id: null,
            createdAt: moment().format('YYYY-MM-DD MM:SS'),
            courseId: this.courseForm.value.courseId,
            courseName: this.getCourseName(this.courseForm.value.courseId),
            instructorId: this.user.id,
            instructorName: `${this.user.firstName} ${this.user.lastName}`,
            moduleId: this.courseForm.value.moduleId,
            moduleName: this.getModuleName(this.courseForm.value.moduleId),
        };

        console.log('Atendence Details', attendance);

        this._AttendenceService
            .create(attendance)
            .subscribe((createdAttendance) => {
                console.log('Attendance Created:', createdAttendance);

                const studentRecords: NewAttendenceStudentsRecord[] =
                    this.dataSource.data.map((student) => ({
                        id: null,
                        attendenceId: createdAttendance.body.id,
                        studentId: student.studentId,
                        studentName: student.studentName,
                        createdAt: new Date().toISOString(),
                        createdBy: this.user.id,
                        isPresent: student.isPresent,
                    }));

                studentRecords.forEach((record) => {
                    this._AttendenceStudentsRecordService
                        .create(record)
                        .subscribe(() => {
                            console.log(
                                'Attendance record saved successfully for:',
                                record.studentName
                            );
                        });
                });

                this.resetForm();
                // alert('Attendance marked successfully');
            });
    }
}
