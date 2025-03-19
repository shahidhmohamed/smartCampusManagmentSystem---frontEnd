import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IModule, NewModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';

@Component({
    selector: 'app-course-modules-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSlideToggleModule,
        MatSelectModule,
    ],
    templateUrl: './course-modules-dialog.component.html',
    styleUrl: './course-modules-dialog.component.scss',
})
export class CourseModulesDialogComponent implements OnInit {
    modules: IModule[] = [];
    allinstructor: IUser[] = [];
    newModule: boolean = false;
    filteredModules: IModule[] = [];
    selectedModules: Set<string> = new Set();
    searchControl = new FormControl('');
    newModulesForm: UntypedFormGroup;

    @ViewChild('newModuleInput') newModuleInput: ElementRef;

    semesters = [
        { id: '1_SEMESTERS', name: '1_SEMESTERS' },
        { id: '2_SEMESTERS', name: '2_SEMESTERS' },
        { id: '3_SEMESTERS', name: '3_SEMESTERS' },
        { id: '4_SEMESTERS', name: '4_SEMESTERS' },
    ];

    constructor(
        private _fb: FormBuilder,
        private _userService: UserManagementService,
        private _cd: ChangeDetectorRef,
        public dialogRef: MatDialogRef<CourseModulesDialogComponent>,
        private _moduleService: ModuleService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        if (this.data?.courseId) {
            this.getAllModulesByCourseId();
        }

        this.newModulesForm = this._fb.group({
            moduleName: [''],
            moduleCode: [''],
            courseId: [''],
            lecturerId: [''],
            duration: [''],
            semester: [''],
        });

        this.searchControl.valueChanges.subscribe((query) => {
            this.filterModules(query);
        });

        this.loadAll();

        this._cd.detectChanges();
    }

    toggleNewModule() {
        this.newModule = !this.newModule;
    }

    loadAll() {
        this._userService.query().subscribe((response) => {
            if (response.body) {
                this.allinstructor = response.body.filter((user) =>
                    user.authorities?.includes('ROLE_LECTURE')
                );

                console.log('Allinsssss', this.allinstructor);
            }
        });

        this._cd.detectChanges();
    }

    getAllModulesByCourseId(): void {
        this._moduleService
            .search({
                query: `courseId:${this.data?.courseId || ''}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((res) => {
                if (res.body) {
                    this.modules = res.body;
                    this.filteredModules = [...this.modules]; // Initialize filtered list
                    console.log('Updated Modules:', this.modules); // Debugging
                }
            });

        this._cd.detectChanges();
    }

    filterModules(query: string): void {
        this.filteredModules = this.modules.filter((module) =>
            module.moduleName.toLowerCase().includes(query.toLowerCase())
        );
        this._cd.detectChanges();
    }

    toggleModuleSelection(moduleId: string): void {
        if (this.selectedModules.has(moduleId)) {
            this.selectedModules.delete(moduleId);
        } else {
            this.selectedModules.add(moduleId);
        }
        this._cd.detectChanges();
    }

    createModule(): void {
        const module: IModule = this.newModulesForm.value;

        const newCourse: NewModule = {
            id: null,
            moduleName: module.moduleName,
            moduleCode: module.moduleCode,
            courseId: this.data?.courseId,
            lecturerId: module.lecturerId,
            semester: module.semester,
            duration: module.duration,
        };

        this._moduleService.create(newCourse).subscribe((res) => {
            if (res.body) {
                console.log('Module Created Successfully', res.body);

                // Add the new module to the list manually
                this.modules.push(res.body);
                this.filteredModules = [...this.modules];

                // Delay fetching to ensure backend updates
                setTimeout(() => {
                    this.getAllModulesByCourseId();
                }, 500);

                this.newModule = false;
                this.newModulesForm.reset();

                this._cd.detectChanges();
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
