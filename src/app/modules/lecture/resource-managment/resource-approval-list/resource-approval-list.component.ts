import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
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

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
    MatPaginator,
    MatPaginatorModule,
    PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { IResourceBooking } from 'app/services/resource-booking/resource-booking.model';
import { ResourceBookingService } from 'app/services/resource-booking/service/resource-booking.service';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { environment } from 'environments/environment';
import { Observable, Subject, map, startWith, takeUntil } from 'rxjs';

dayjs.extend(utc);
dayjs.extend(timezone);

const DATE_TIME_DISPLAY_FORMAT = 'YYYY MMMM DD, hh:mm A';

@Component({
    selector: 'app-resource-approval-list',
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
        MatAutocompleteModule,
    ],
    templateUrl: './resource-approval-list.component.html',
})
export class ResourceApprovalListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    drawerMode: 'side' | 'over' = 'side';

    campusResourceBookings: IResourceBooking[] = [];
    campusResources: IResource[] = [];
    resourceControl = new FormControl();
    filteredResource$: Observable<IResource[]>;
    selectedResourceBooking: IResourceBooking | null = null;
    selectedResourceBookingForm: UntypedFormGroup;
    isAddingNew: boolean = false;
    searchInputControl: '';
    dataSource = new MatTableDataSource<any>();

    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _ResourceBookingService: ResourceBookingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _resourceService: ResourceService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        // Initialize form
        this.selectedResourceBookingForm = this._formBuilder.group({
            id: [''],
            resource: [null, Validators.required], // Corrected from {}
            userId: [environment.user.id],
            startTime: [null, Validators.required],
            endTime: [null, Validators.required],
            status: ['PENDING'],
            reason: [''],
            adminComment: [''],
        });

        this.filteredResource$ = this.resourceControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string' ? value : value?.name || ''
            ),
            map((name) => this.filterResource(name))
        );

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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /** Fetch all booked resources */
    getAllCampusResourcesBookList() {
        const params = {
            page: this.pagination.page,
            size: this.pagination.size,
        };
        this._ResourceBookingService
            .search({
                query: `userId:${environment.user.firstName} ${environment.user.lastName}`,
                size: 100,
                sort: ['desc'],
            })
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
        this._resourceService
            .query()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.campusResources = response.body || [];
                // this.filteredResource = this.campusResources.filter(
                //     (res) => res.availability === true
                // );
                this._changeDetectorRef.detectChanges();
            });
    }

    getResourceName(resourceId: string): string {
        const resource = this.campusResources.find(
            (res) => res.id === resourceId
        );
        return resource ? resource.name : 'Unknown Resource';
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
            this.selectedResourceBookingForm.patchValue({
                resource: selectedResource.id,
            });
        }
        this._changeDetectorRef.detectChanges();
    }

    displayResource(resource: IResource | null): string {
        return resource
            ? `${resource.name} ${resource.resourceType || ''}`
            : '';
    }
    /** Open drawer for adding a new booking */
    openAddBookingDrawer(): void {
        this.isAddingNew = true;
        this.selectedResourceBooking = null;
        this.selectedResourceBookingForm.reset();
        this.matDrawer.open();
        this._changeDetectorRef.detectChanges();
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
                this._changeDetectorRef.detectChanges();
            });
    }

    /** Save a new or edited booking */
    saveResourceBooking(): void {
        if (this.selectedResourceBookingForm.invalid) {
            return;
        }

        let bookingData = { ...this.selectedResourceBookingForm.value };

        bookingData.status = 'PENDING';
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
                    setTimeout(() => {
                        this.getAllCampusResourcesBookList();
                        this.matDrawer.close();
                    }, 1000);
                    this._changeDetectorRef.detectChanges();
                });
        } else {
            this._ResourceBookingService
                .update(bookingData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    setTimeout(() => {
                        this.getAllCampusResourcesBookList();
                        this.matDrawer.close();
                    }, 1000);
                    this._changeDetectorRef.detectChanges();
                });
        }
        this._changeDetectorRef.detectChanges();
    }

    /** Delete a booking */
    deleteResourceBooking(bookingId: string, event: Event): void {
        event.stopPropagation();
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Booking',
            message:
                'Are you sure you want to delete this Booking? This action is irreversible.',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._ResourceBookingService
                    .delete(bookingId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => {
                        setTimeout(() => {
                            this.getAllCampusResourcesBookList();
                            this.matDrawer.close();
                            this._changeDetectorRef.detectChanges();
                        }, 1000);
                    });
            }
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
        this._changeDetectorRef.detectChanges();
    }
}
