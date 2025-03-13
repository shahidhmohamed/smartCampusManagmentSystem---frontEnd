import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelect } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const DATE_TIME_DISPLAY_FORMAT = 'YYYY MMMM DD, hh:mm A';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        DatePipe,
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
    ],
})
export class ResourceManagment implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    campusResources: IResource[] = [];
    selectedResource: IResource | null = null;
    selectedResourceForm: UntypedFormGroup;
    isAddingNew = false;
    resourceType: '';
    filterType: string | null = null;
    searchInputControl = new FormControl('');
    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };
    resourceTypes = [
        { label: 'ROOM', value: 'ROOM' },
        { label: 'PROJECTOR', value: 'PROJECTOR' },
        { label: 'LAPTOP', value: 'LAPTOP' },
        { label: 'WHITEBOARD', value: 'WHITEBOARD' },
        { label: 'LAB', value: 'LAB' },
        { label: 'COMPUTER LAB', value: 'COMPUTER_LAB' },
        { label: 'AUDITORIUM', value: 'AUDITORIUM' },
        { label: 'PRINTER', value: 'PRINTER' },
        { label: 'DESK', value: 'DESK' },
        { label: 'STUDY ROOM', value: 'STUDY_ROOM' },
        { label: 'MEETING ROOM', value: 'MEETING_ROOM' },
        { label: 'SMART BOARD', value: 'SMART_BOARD' },
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private resourceService: ResourceService,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        this.searchInputControl.valueChanges.subscribe(() => {
            this.pagination.page = 0;
            this.searchResources();
        });
    }

    ngOnInit(): void {
        this.selectedResourceForm = this._formBuilder.group({
            id: [''],
            resourceId: [''],
            name: ['', Validators.required],
            resourceType: ['', Validators.required],
            location: ['', Validators.required],
            capacity: [0, [Validators.required, Validators.min(1)]],
            availability: [''],
        });

        this.route.queryParams.subscribe((params) => {
            this.filterType = params['filter'] || null;
            // alert(this.filterType);

            this.getAllCampusResources();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getAllCampusResources() {
        this.resourceService.query().subscribe((response) => {
            let resources = response.body || [];

            // Apply filter from the selected dashboard resource
            if (this.filterType) {
                resources = resources.filter(
                    (res) => res.resourceType === this.filterType
                );
            }

            console.log(resources);

            this.campusResources = resources;
            this.pagination.length = resources.length;
            this._changeDetectorRef.detectChanges();
        });
    }

    searchResources() {
        // const searchTerm = this.searchInputControl.value?.trim();
        // if (!searchTerm) {
        //     this.getAllCampusResources();
        //     return;
        // }
        // this.resourceService
        //     .search({ query: searchTerm, page: this.pagination.page, size: 10 })
        //     .subscribe((response) => {
        //         this.campusResources = response.body || [];
        //         this.pagination.length = Number(
        //             response.headers.get('X-Total-Count')
        //         );
        //     });
    }

    toggleDetails(resourceId: string): void {
        this.isAddingNew = false;

        this.resourceService.find(resourceId).subscribe((response) => {
            this.selectedResource = response.body;
            this.selectedResourceForm.patchValue(this.selectedResource);
            this.matDrawer.open();
        });
    }

    openAddResourceDrawer(): void {
        this.isAddingNew = true;
        this.selectedResource = null;
        this.selectedResourceForm.reset();
        this.matDrawer.open();
    }

    saveResource(): void {
        if (this.selectedResourceForm.invalid) {
            return;
        }

        const formData = { ...this.selectedResourceForm.value };

        if (this.isAddingNew) {
            this.resourceService.create(formData).subscribe(() => {
                this.getAllCampusResources();
                this.matDrawer.close();
            });
        } else {
            this.resourceService.update(formData).subscribe(() => {
                this.getAllCampusResources();
                this.matDrawer.close();
            });
        }
    }

    deleteResource(resourceId: string, event: Event): void {
        event.stopPropagation();
        this.resourceService.delete(resourceId).subscribe(() => {
            this.getAllCampusResources();
        });
    }
}
