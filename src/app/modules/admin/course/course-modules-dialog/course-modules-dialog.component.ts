import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';

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
    ],
    templateUrl: './course-modules-dialog.component.html',
    styleUrl: './course-modules-dialog.component.scss',
})
export class CourseModulesDialogComponent implements OnInit {
    modules: IModule[] = [];
    filteredModules: IModule[] = [];
    selectedModules: Set<string> = new Set();
    searchControl = new FormControl('');

    @ViewChild('newModuleInput') newModuleInput: ElementRef;

    constructor(
        public dialogRef: MatDialogRef<CourseModulesDialogComponent>,
        private _moduleService: ModuleService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        if (this.data?.courseId) {
            this.getAllModulesByCourseId();
        }

        this.searchControl.valueChanges.subscribe((query) => {
            this.filterModules(query);
        });
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
                }
            });
    }

    filterModules(query: string): void {
        this.filteredModules = this.modules.filter((module) =>
            module.moduleName.toLowerCase().includes(query.toLowerCase())
        );
    }

    toggleModuleSelection(moduleId: string): void {
        if (this.selectedModules.has(moduleId)) {
            this.selectedModules.delete(moduleId);
        } else {
            this.selectedModules.add(moduleId);
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
