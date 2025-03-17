import { CommonModule } from '@angular/common';
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
import { Router } from '@angular/router';
import {
    IAssignment,
    NewAssignment,
} from 'app/services/assignment/assignment.model';
import { AssignmentService } from 'app/services/assignment/service/assignment.service';
import { ICourse } from 'app/services/course/course.model';
import { CourseService } from 'app/services/course/service/course.service';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { User } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-lecture-assignment',
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
    templateUrl: './lecture-assignment.component.html',
    styleUrl: './lecture-assignment.component.scss',
})
export class LectureAssignmentComponent implements OnInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    searchText = new FormControl('');
    user: User = environment.user;
    createForm: boolean = false;
    displayedColumns: string[] = [
        'Course',
        'Module',
        'Title',
        'DueDate',
        'Submitions',
        'Action',
    ];
    dataSource = new MatTableDataSource<IAssignment>();

    assignmentForm: UntypedFormGroup;
    createFormVisible: boolean = false;

    // Course Selection
    coursesControl = new FormControl();
    filteredCourses$: Observable<ICourse[]>;
    allCourses: ICourse[] = [];
    allModules: IModule[] = [];

    // Module Selection
    modules: IModule[] = [];
    moduleControl = new FormControl();

    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    // Instructor Data
    instructorId: string | null = null;

    constructor(
        private router: Router,
        private _courseService: CourseService,
        private _moduleService: ModuleService,
        private _assignmentService: AssignmentService,
        private _userService: UserManagementService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.assignmentForm = this._formBuilder.group({
            id: [''],
            courseId: ['', Validators.required],
            moduleId: ['', Validators.required],
            title: ['', Validators.required],
            description: ['', Validators.required],
            instructorId: [this.user.id],
            deadLine: ['', Validators.required],
            createdBy: [this.user.id],
            createdAt: ['', Validators.required],
            modifiedAt: [moment().format('YYYY-MM-DD MM:SS')],
        });

        this.loadCourses();
        this.loadAssignments();

        this.filteredCourses$ = this.coursesControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.courseName?.toLowerCase() || ''
            ),
            map((name) => this.filterCourses(name))
        );

        this.instructorId = environment.user.id;
    }

    goToSubmissions(courseId: string): void {
        this.router.navigate(['lecture/submissions', courseId]);
    }

    loadCourses(): void {
        this._courseService.query().subscribe((res) => {
            this.allCourses = res.body || [];
            this._changeDetectorRef.detectChanges();
        });

        this._moduleService.query().subscribe((res) => {
            this.allModules = res.body;
        });
    }

    loadAssignments(): void {
        this._assignmentService.query().subscribe((res) => {
            this.dataSource.data = res.body || [];
        });
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
        if (selectedCourse) {
            this.assignmentForm.patchValue({
                courseId: selectedCourse.id,
            });
            this.loadModulesForCourse(selectedCourse.id);
        }
    }

    toggleForm(): void {
        this.createForm = !this.createForm;
    }

    resetForm(): void {
        this.createForm = false;
        this.assignmentForm.reset();
        this.coursesControl.setValue('');
    }

    saveCourseRegister(): void {
        const assignmentData: IAssignment = this.assignmentForm.value;

        if (assignmentData.id) {
            this._assignmentService.update(assignmentData).subscribe(() => {
                this.loadAssignments();
                this.createForm = false;
            });
        } else {
            const newAssignment: NewAssignment = {
                ...assignmentData,
                createdAt: moment().format('YYYY-MM-DD MM:SS'),
                instructorId: this.user.id,
                createdBy: this.user.id,
                id: null,
            };
            this._assignmentService.create(newAssignment).subscribe(() => {
                this.loadAssignments();
                this.resetForm();
                this.createForm = false;
            });
        }
    }

    editAssignment(assignment: IAssignment): void {
        this.createForm = true;
        this.assignmentForm.patchValue(assignment);
        const selectedCourse = this.allCourses.find(
            (c) => c.id === assignment.courseId
        );
        if (selectedCourse) {
            this.coursesControl.setValue(selectedCourse);
        } else {
            console.warn('Course not found for ID:', assignment.courseId);
        }
        this.loadModulesForCourse(assignment.courseId);
    }

    deleteAssignment(assignment: IAssignment): void {
        this._assignmentService.delete(assignment.id).subscribe(() => {
            this.loadAssignments();
        });
    }

    displayCourseName(course: ICourse): string {
        return course ? `${course.courseCode} - ${course.courseName}` : '';
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
}
