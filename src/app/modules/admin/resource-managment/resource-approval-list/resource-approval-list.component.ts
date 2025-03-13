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

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { IResourceBooking } from 'app/services/resource-booking/resource-booking.model';
import { ResourceBookingService } from 'app/services/resource-booking/service/resource-booking.service';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';

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
    ],
    templateUrl: './resource-approval-list.component.html',
})
export class ResourceApprovalListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over' = 'side';

    campusResourceBookings: IResourceBooking[] = [];
    campusResources: IResource[] = [];
    selectedResourceBooking: IResourceBooking | null = null;
    selectedResourceBookingForm: UntypedFormGroup;
    isAddingNew: boolean = false;
    searchInputControl: '';

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
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        // Initialize form
        this.selectedResourceBookingForm = this._formBuilder.group({
            id: [''],
            resource: [null, Validators.required], // Corrected from {}
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /** Fetch all booked resources */
    getAllCampusResourcesBookList() {
        this._ResourceBookingService
            .query()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.campusResourceBookings = response.body || [];
                this.pagination.length = this.campusResourceBookings.length;
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
                this._changeDetectorRef.detectChanges();
            });
    }

    /** Open drawer for adding a new booking */
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

        // Convert `resource` from ID to object format
        bookingData.resource = bookingData.resource
            ? { id: bookingData.resource }
            : null;

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
}
