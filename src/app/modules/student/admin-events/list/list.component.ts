import {
    CdkDrag,
    CdkDragDrop,
    CdkDragHandle,
    CdkDropList,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import {
    CUSTOM_ELEMENTS_SCHEMA,
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
import { ICampusEvent } from 'app/services/campus-event/campus-event.model';
import { CampusEventService } from 'app/services/campus-event/service/campus-event.service';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { GenericPagination } from 'app/models/GenericPagination';
import { User } from 'app/services/user/service/user-management.model';
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
        FullCalendarModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TasksListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    userId: string = environment.user.id;
    drawerMode: 'side' | 'over';
    campusEvent: ICampusEvent[] = [];
    selectedEvent: ICampusEvent | null = null;
    selectedEventForm: UntypedFormGroup;
    isAddingNew: boolean = false;
    searchInputControl = new FormControl('');
    pagination: GenericPagination = {
        length: 0,
        size: 10,
        page: 0,
        lastPage: 0,
        startIndex: 0,
        endIndex: 0,
    };
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin],
        events: [],
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    status = [
        { label: 'UPCOMING', value: 'UPCOMING' },
        { label: 'ONGOING', value: 'ONGOING' },
        { label: 'COMPLETED', value: 'COMPLETED' },
        { label: 'CANCLLED', value: 'CANCLLED' },
    ];

    approval = [
        { label: 'ACCEPTED', value: 'ACCEPTED' },
        { label: 'REJECTED', value: 'REJECTED' },
    ];

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _adminEventService: CampusEventService
    ) {
        this.searchInputControl.valueChanges.subscribe((w) => {
            this.pagination.page = 0;
            this.searchProduct();
        });
    }

    ngOnInit(): void {
        this.selectedEventForm = this._formBuilder.group({
            id: [''],
            eventName: ['', Validators.required],
            description: [''],
            eventDate: [null],
            location: [''],
            organizerId: [environment.user.id],
            eventType: [''],
            capacity: [0],
            status: [''],
        });

        this.getAllCampusEvent();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getAllCampusEvent(): void {
        this._adminEventService
            .getAllItems()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: any[]) => {
                    this.campusEvent = response;
                    environment.allevents = response.length;

                    this.calendarOptions.events = response
                        .map((event) => {
                            const eventDate = new Date(event.eventDate);
                            if (isNaN(eventDate.getTime())) {
                                console.error(
                                    'Invalid date format for event:',
                                    event
                                );
                                return null;
                            }
                            return {
                                title: event.eventName,
                                start: eventDate,
                                color: '#3f51b5',
                                allDay: true,
                            };
                        })
                        .filter((event) => event !== null);
                    this._changeDetectorRef.detectChanges();
                },
                error: (error) => {
                    console.error('Failed to fetch campus events:', error);
                },
            });
    }

    searchProduct() {
        const searchTerm = this.searchInputControl.value?.trim();
        if (!searchTerm) {
            this.getAllCampusEvent();
            return;
        }
        this._adminEventService
            .getAllItemsSearch(
                this.searchInputControl.value + '*',
                this.pagination.page,
                10
            )
            .subscribe((i) => {
                this.pagination.length = Number(i.headers.get('X-Total-Count'));

                // this.allCats = i;
                this.campusEvent = i.body;
            });
    }

    /**
     * Open drawer for adding a new event
     */
    openAddEventDrawer(): void {
        this.isAddingNew = true;
        this.selectedEvent = null;
        this.selectedEventForm.reset();
        this.matDrawer.open(); // Ensure this is being triggered
        this._changeDetectorRef.markForCheck();
    }

    getMoment(date) {
        return this.getMoment(date);
    }

    /**
     * Open drawer with event details
     */
    toggleDetails(eventId: string): void {
        this.isAddingNew = false;

        this._adminEventService.find(eventId).subscribe((response) => {
            this.selectedEvent = response.body;

            // if (this.selectedEvent?.eventDate) {
            //     this.selectedEvent.eventDate = dayjs.utc(this.selectedEvent.eventDate);
            // }

            this.selectedEventForm.patchValue(this.selectedEvent);
            this.matDrawer.open();
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Save event (new or edited)
     */
    saveEvent(): void {
        if (this.selectedEventForm.invalid) {
            console.error('Form is invalid:', this.selectedEventForm.errors);
            return;
        }

        const formData = { ...this.selectedEventForm.value };

        formData.organizerId = environment.user.id;

        console.log('Payload being sent:', formData);

        if (this.isAddingNew) {
            this._adminEventService.create(formData).subscribe(() => {
                this.getAllCampusEvent();
                this.matDrawer.close();
            });
        } else {
            this._adminEventService.update(formData).subscribe(() => {
                this.getAllCampusEvent();
                this.matDrawer.close();
            });
        }
    }

    deleteTask(taskId: string, event: Event): void {
        event.stopPropagation();
        this._adminEventService.delete(taskId).subscribe(() => {
            this.getAllCampusEvent(); // Refresh the list after deletion
        });
    }

    /**
     * Drag and drop event handling
     */
    dropped(event: CdkDragDrop<ICampusEvent[]>): void {
        moveItemInArray(
            this.campusEvent,
            event.previousIndex,
            event.currentIndex
        );
        this._changeDetectorRef.markForCheck();
    }
}
