import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
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
import {
    MatPaginator,
    MatPaginatorModule,
    PageEvent,
} from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GenericPagination } from 'app/models/GenericPagination';
import { IResourceBooking } from 'app/services/resource-booking/resource-booking.model';
import { ResourceBookingService } from 'app/services/resource-booking/service/resource-booking.service';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-resource-approval',
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
        MatTableModule,
        MatPaginatorModule,
    ],
    templateUrl: './resource-approval.component.html',
    styleUrl: './resource-approval.component.scss',
})
export class ResourceApprovalComponent {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    searchInputControl = new FormControl('');
    drawerMode: 'side' | 'over';
    campusResourceBookings: IResourceBooking[] = [];
    campusResources: IResource[] = [];
    selectedResourceBooking: IResourceBooking | null = null;
    isAddingNew: boolean = false;
    dataSource = new MatTableDataSource<any>();
    selectedResourceBookingForm: UntypedFormGroup;
    pagination: GenericPagination = {
        length: 0,
        size: 10,
        page: 0,
        lastPage: 0,
        startIndex: 0,
        endIndex: 0,
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _ResourceBookingService: ResourceBookingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _resourceService: ResourceService,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        // Initialize form
        this.selectedResourceBookingForm = this._formBuilder.group({
            id: [''],
            resource: [null, Validators.required],
            userId: [environment.user.id],
            startTime: [null, Validators.required],
            endTime: [null, Validators.required],
            status: ['', Validators.required],
            reason: [''],
            adminComment: [''],
        });

        // Load resources and bookings
        this.getAllCampusResources();
        this.getAllCampusResourcesBookList();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this._paginator;
        // this._paginator.page.subscribe(() => {
        //     this.pagination.page = this._paginator.pageIndex;
        //     this.searchProduct();
        // });
    }

    getAllCampusResourcesBookList() {
        this._ResourceBookingService
            .query()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.campusResourceBookings = response.body || [];
                this.pagination.length = this.campusResourceBookings.length;
                this.dataSource = new MatTableDataSource(
                    this.campusResourceBookings
                );
                console.log(this.dataSource.filteredData);
                this._changeDetectorRef.detectChanges();
            });
    }

    /** Fetch all available resources */
    getAllCampusResources() {
        const params = {
            page: this.pagination.page,
            size: this.pagination.size,
            sort: 'asc',
        };
        this._resourceService
            .query(params)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.campusResources = response.body || [];
                this._changeDetectorRef.detectChanges();
            });
    }

    openAddBookingDrawer(): void {
        this.isAddingNew = true;
        this.selectedResourceBooking = null;
        this.selectedResourceBookingForm.reset();
        this.matDrawer.open();
    }

    /** Open booking details in drawer */
    toggleBookingDetails(bookingId: string): void {
        this.isAddingNew = false;

        this._ResourceBookingService
            .find(bookingId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.selectedResourceBooking = response.body;

                if (this.selectedResourceBooking) {
                    this.selectedResourceBookingForm.patchValue({
                        ...this.selectedResourceBooking,
                        resource:
                            this.selectedResourceBooking.resource?.id || null,
                    });
                }

                this.matDrawer.open();
            });
    }

    /** Save a new or edited booking */
    saveResourceBooking(): void {
        if (this.selectedResourceBookingForm.invalid) {
            return;
        }

        let bookingData = { ...this.selectedResourceBookingForm.value };
        // alert(JSON.stringify(environment.user));
        bookingData.userId = environment.user.name;

        // Ensure resource is an object with an id
        if (bookingData.resource) {
            bookingData.resource = {
                id: bookingData.resource,
                // name: bookingData.resource.name,
                // resourceType: bookingData.resource.resourceType,
            };
        } else {
            bookingData.resource = { userId: environment.user.name };
        }

        console.log('Final bookingData:', bookingData);

        if (this.isAddingNew) {
            this._ResourceBookingService
                .create(bookingData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this.getAllCampusResourcesBookList();
                    this.matDrawer.close();
                });
        } else {
            this._ResourceBookingService
                .update(bookingData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this.getAllCampusResourcesBookList();
                    this.matDrawer.close();
                });
        }
    }

    /** Delete a booking */
    deleteResourceBooking(bookingId: string, event: Event): void {
        event.stopPropagation();
        this._ResourceBookingService
            .delete(bookingId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.getAllCampusResourcesBookList();
            });
    }

    /** Optimize rendering with trackBy */
    trackByFn(index: number, item: IResourceBooking): string {
        return item.id;
    }

    handlePageEvent(event: PageEvent) {
        this.pagination.page = event.pageIndex;
        this.pagination.size = event.pageSize;

        this.getAllCampusResourcesBookList();
    }
}
