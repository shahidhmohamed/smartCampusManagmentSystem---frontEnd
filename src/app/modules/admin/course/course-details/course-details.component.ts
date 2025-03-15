import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {
    MatPaginator,
    MatPaginatorModule,
    PageEvent,
} from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ICourse, NewCourse } from 'app/services/course/course.model';
import { CourseService } from 'app/services/course/service/course.service';
import { CourseModulesDialogComponent } from '../course-modules-dialog/course-modules-dialog.component';
@Component({
    selector: 'app-course-details',
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
    templateUrl: './course-details.component.html',
    styleUrl: './course-details.component.scss',
})
export class CourseDetailsComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    searchText = new FormControl('');
    courseForm: UntypedFormGroup;
    createForm: boolean = false;
    dataSource = new MatTableDataSource<ICourse>();
    displayedColumns: string[] = [
        'courseName',
        'courseCode',
        'department',
        'subjects',
        'actions',
    ];

    semesters = [
        { id: '2_SEMESTERS', name: '2_SEMESTERS' },
        { id: '4_SEMESTERS', name: '4_SEMESTERS' },
    ];
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
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.courseForm = this._formBuilder.group({
            id: [''],
            courseName: [null, Validators.required],
            courseCode: ['', Validators.required],
            department: ['', Validators.required],
            duration: ['', Validators.required],
        });

        this.loadCourses();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this._paginator;
    }

    toggleForm(): void {
        this.resetForm();
        this.createForm = !this.createForm;
    }

    // Load all courses
    loadCourses(): void {
        this._courseService
            .query()
            .subscribe((res: HttpResponse<ICourse[]>) => {
                if (res.body) {
                    this.dataSource.data = res.body;
                    this.pagination.length = res.body.length;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    // Create or update a course
    saveCourse(): void {
        if (this.courseForm.invalid) {
            return;
        }

        const courseData: ICourse = this.courseForm.value;

        if (courseData.id) {
            // Update existing course
            this._courseService.update(courseData).subscribe(() => {
                this.loadCourses();
                this.createForm = false;
                this.resetForm();
            });
        } else {
            // Create new course
            const newCourse: NewCourse = { ...courseData, id: null };
            this._courseService.create(newCourse).subscribe(() => {
                this.loadCourses();
                this.resetForm();
            });
        }
    }

    // Edit a course
    editCourse(course: ICourse): void {
        this.createForm = !this.createForm;
        this.courseForm.patchValue(course);
    }

    // Delete a course
    deleteCourse(course: ICourse): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Course',
            message: `Are you sure you want to delete "${course.courseName}"?`,
            actions: { confirm: { label: 'Yes' }, cancel: { label: 'No' } },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._courseService.delete(course.id).subscribe(() => {
                    this.loadCourses();
                });
            }
        });
    }

    // Reset form after save or cancel
    resetForm(): void {
        this.courseForm.reset();
    }

    closeForm(): void {
        this.resetForm();
        this.createForm = !this.createForm;
    }

    // Search courses
    searchCourses(): void {
        const searchValue = this.courseForm.value.courseName;
        if (searchValue) {
            this._courseService
                .search({ query: searchValue })
                .subscribe((res: HttpResponse<ICourse[]>) => {
                    if (res.body) {
                        this.dataSource.data = res.body;
                    }
                });
        } else {
            this.loadCourses();
        }
    }
    handlePageEvent(event: PageEvent) {
        this.pagination.page = event.pageIndex;
        this.pagination.size = event.pageSize;

        this.loadCourses();
        this._changeDetectorRef.detectChanges();
    }

    openModulesDialog(course: ICourse): void {
        this.dialog.open(CourseModulesDialogComponent, {
            width: '300px',
            data: {
                courseId: course.id,
                courseName: course.courseName,
            },
        });
    }
}
