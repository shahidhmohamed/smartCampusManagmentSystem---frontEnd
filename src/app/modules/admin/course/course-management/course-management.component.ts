import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
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
    ICourseRegistration,
    NewCourseRegistration,
} from 'app/services/course-registration/course-registration.model';
import { CourseRegistrationService } from 'app/services/course-registration/service/course-registration.service';
import { ICourse } from 'app/services/course/course.model';
import { CourseService } from 'app/services/course/service/course.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-course-management',
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
    templateUrl: './course-management.component.html',
    styleUrl: './course-management.component.scss',
})
export class CourseManagementComponent {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    searchText = new FormControl('');
    createForm: boolean = false;
    displayedColumns: string[] = [
        'Student',
        'Course',
        'RegisterDate',
        'Action',
    ];
    // dataSource = ELEMENT_DATA;
    registerForm: UntypedFormGroup;
    dataSource = new MatTableDataSource<ICourseRegistration>();

    coursesControl = new FormControl();
    filteredCourses$: Observable<ICourse[]>;
    allCourses: ICourse[] = [];

    studentControl = new FormControl();
    filteredStudents$: Observable<IUser[]>;
    allStudents: IUser[] = [];

    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    constructor(
        private _courseService: CourseService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private dialog: MatDialog,
        private _userService: UserManagementService,
        private _courseRegisterService: CourseRegistrationService
    ) {}

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            id: [''],
            studentId: [''],
            courseId: [''],
            courseCode: [''],
            registrationDate: [''],
            duration: [''],
        });

        this.loadCoursesAndStudents();
        this.loadAllRegisterCourses();

        this.filteredCourses$ = this.coursesControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.courseName?.toLowerCase() || ''
            ),
            map((name) => this.filterCourses(name))
        );

        this.filteredStudents$ = this.studentControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.firstName?.toLowerCase() || ''
            ),
            map((name) => this.filterStudents(name))
        );
    }

    loadCoursesAndStudents(): void {
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
                this.allStudents = response.body.filter((user) =>
                    user.authorities?.includes('ROLE_STUDENT')
                );
            }
        });
    }

    loadAllRegisterCourses(): void {
        this._courseRegisterService.query().subscribe((res) => {
            this.dataSource.data = res.body || [];
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

    onSelectCourse(event: any) {
        const selectedCourse: ICourse = event.option.value;
        console.log(selectedCourse.id);
        if (selectedCourse) {
            this.registerForm.patchValue({
                courseId: selectedCourse.id,
                courseCode: selectedCourse.courseCode,
                duration: selectedCourse.duration,
            });
        }
    }

    displayCourseName(course: ICourse): string {
        return course && course.courseName
            ? `${course.courseCode} ${course.courseName || ''}`
            : '';
    }

    filterStudents(name: string): IUser[] {
        if (!name) return this.allStudents;
        const filterValue = name.toLowerCase();
        return this.allStudents.filter(
            (student) =>
                student.firstName?.toLowerCase().includes(filterValue) ||
                student.lastName?.toLowerCase().includes(filterValue) ||
                student.login?.toLowerCase().includes(filterValue) ||
                student.id?.toLowerCase().includes(filterValue)
        );
    }

    // When a student is selected
    onSelectStudent(event: any) {
        const selectedStudent: IUser = event.option.value;
        console.log(selectedStudent.id);
        if (selectedStudent) {
            this.registerForm.patchValue({
                studentId: selectedStudent.id,
            });
        }
    }

    displayStudentName(student: IUser | null): string {
        return student ? `${student.firstName} ${student.lastName || ''}` : '';
    }

    toggleForm(): void {
        this.resetForm();
        this.createForm = !this.createForm;
    }

    resetForm(): void {
        this.createForm = false;
        this.coursesControl.setValue('');
        this.studentControl.setValue('');
    }

    saveCourseRegister(): void {
        if (this.registerForm.invalid) {
            return;
        }

        const courseData: ICourseRegistration = this.registerForm.value;

        if (courseData.id) {
            // Update existing course
            this._courseRegisterService.update(courseData).subscribe(() => {
                this.loadAllRegisterCourses();
                this.createForm = false;
                this.resetForm();
            });
        } else {
            // Create new course
            const newCourse: NewCourseRegistration = {
                ...courseData,
                id: null,
                registrationDate: moment().format(),
            };
            this._courseRegisterService.create(newCourse).subscribe(() => {
                this.loadAllRegisterCourses();
                this.resetForm();
            });
        }
    }

    // Edit a course
    editCourseRegitration(course: ICourseRegistration): void {
        this.createForm = true; // Open form

        this.registerForm.patchValue(course);

        // Ensure courses and students are available before searching
        if (!this.allCourses.length || !this.allStudents.length) {
            console.warn('Courses or students data is not loaded yet.');
            return;
        }

        // Set Full Course Object for Mat-Autocomplete
        const selectedCourse = this.allCourses.find(
            (c) => c.id === course.courseId
        );
        if (selectedCourse) {
            this.coursesControl.setValue(selectedCourse); // ✅ Correct way
        } else {
            console.warn('Course not found for ID:', course.courseId);
        }

        // Set Full Student Object for Mat-Autocomplete
        const selectedStudent = this.allStudents.find(
            (s) => s.id === course.studentId
        );
        if (selectedStudent) {
            this.studentControl.setValue(selectedStudent); // ✅ Correct way (Use object)
        } else {
            console.warn('Student not found for ID:', course.studentId);
        }
    }

    deleteCourse(course: ICourse): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete',
            message: `Are you sure you want to delete "${course.id}"?`,
            actions: { confirm: { label: 'Yes' }, cancel: { label: 'No' } },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._courseRegisterService.delete(course.id).subscribe(() => {
                    this.loadAllRegisterCourses();
                });
            }
        });
    }

    getCourseName(courseId: string | undefined | null): string {
        if (!courseId) return 'Unknown Course';
        const course = this.allCourses.find((res) => res.id === courseId);
        return course ? course.courseName : 'Unknown Course';
    }

    getStudentName(studentId: string | undefined | null): string {
        if (!studentId) return 'Unknown Student'; // Handles undefined/null case
        const student = this.allStudents.find((res) => res.id === studentId);
        return student
            ? `${student.firstName} ${student.lastName}`
            : 'Unknown Student';
    }
}
