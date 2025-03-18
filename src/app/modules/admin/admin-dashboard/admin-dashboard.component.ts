import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { CampusEventService } from 'app/services/campus-event/service/campus-event.service';
import { ResourceType } from 'app/services/enumerations/resource-type.model';
import { IResource } from 'app/services/resource/resource.model';
import { ResourceService } from 'app/services/resource/service/resource.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        TranslocoModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatTableModule,
        NgClass,
        CurrencyPipe,
        CommonModule,
    ],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
    user: IUser = environment.user;
    allEvents = 0;
    selectedProject: string = 'ACME Corp. Backend App';
    statusCounts = {};
    resourceCounts = {};
    userCount = {};
    studentCount: number = 0;
    lectureCount: number = 0;
  

    constructor(
        private _adminEventService: CampusEventService,
        private router: Router,
        private _resourceService: ResourceService,
        private _changeDetectorRef: ChangeDetectorRef,
        private userService: UserManagementService
    ) {}

    resourceTypes = [
        { label: 'Room', value: ResourceType.ROOM },
        { label: 'Projector', value: ResourceType.PROJECTOR },
        { label: 'Laptop', value: ResourceType.LAPTOP },
        { label: 'Whiteboard', value: ResourceType.WHITEBOARD },
        { label: 'Lab', value: ResourceType.LAB },
        { label: 'Computer Lab', value: ResourceType.COMPUTER_LAB },
        { label: 'Auditorium', value: ResourceType.AUDITORIUM },
        { label: 'Printer', value: ResourceType.PRINTER },
        { label: 'Desk', value: ResourceType.DESK },
        { label: 'Study Room', value: ResourceType.STUDY_ROOM },
        { label: 'Meeting Room', value: ResourceType.MEETING_ROOM },
        { label: 'Smart Board', value: ResourceType.SMART_BOARD },
    ];

    // Function to assign colors dynamically
    getResourceClass(resourceTypes: string) {
        const colors = {
            ROOM: 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white',
            PROJECTOR:
                'bg-gradient-to-r from-green-500 to-green-700 text-white',
            LAPTOP: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white',
            WHITEBOARD: 'bg-gradient-to-r from-blue-500 to-blue-700 text-white',
            LAB: 'bg-gradient-to-r from-red-500 to-red-700 text-white',
            'COMPUTER LAB':
                'bg-gradient-to-r from-purple-500 to-purple-700 text-white',
            AUDITORIUM:
                'bg-gradient-to-r from-orange-500 to-orange-700 text-white',
            PRINTER:
                'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white',
            DESK: 'bg-gradient-to-r from-teal-500 to-teal-700 text-white',
            'STUDY ROOM':
                'bg-gradient-to-r from-pink-500 to-pink-700 text-white',
            'MEETING ROOM':
                'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white',
            'SMART BOARD':
                'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white',
        };
        return (
            colors[resourceTypes] ||
            'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
        );
    }

    getResourceIcon(resourceTypes: string) {
        const icons = {
            ROOM: 'fas fa-door-open',
            PROJECTOR: 'fas fa-video',
            LAPTOP: 'fas fa-laptop',
            WHITEBOARD: 'fas fa-chalkboard',
            LAB: 'fas fa-flask',
            'COMPUTER LAB': 'fas fa-desktop',
            AUDITORIUM: 'fas fa-theater-masks',
            PRINTER: 'fas fa-print',
            DESK: 'fas fa-chair',
            'STUDY ROOM': 'fas fa-book',
            'MEETING ROOM': 'fas fa-users',
            'SMART BOARD': 'fas fa-tablet-alt',
        };
        return icons[resourceTypes] || 'fas fa-box';
    }

    ngOnInit(): void {
        this.user = environment.user;
        this.getAllCampusEvent();
        this.getAllCampusResources();
        this.getUserCount();
        this._changeDetectorRef.detectChanges();
    }

    onResourceCardClick(resourceName: string) {
        this.router.navigate(['/admin/resource-management'], {
            queryParams: { filter: resourceName },
        });
    }

    getAllCampusResources() {
        this._resourceService.query().subscribe((response) => {
            const resources: IResource[] = response.body || [];

            console.log('Fetched Resources:', resources);

            this.resourceCounts = {};

            this.resourceTypes.forEach((type) => {
                this.resourceCounts[type.value] = 0;
            });

            // Count occurrences of each resource type
            resources.forEach((resource) => {
                const typeKey = resource.resourceType as ResourceType;
                if (typeKey && this.resourceCounts.hasOwnProperty(typeKey)) {
                    this.resourceCounts[typeKey]++;
                }
            });

            console.log('Computed Resource Counts:', this.resourceCounts);

            this._changeDetectorRef.detectChanges();
        });
    }

    getAllCampusEvent() {
        this._adminEventService.getAllItems().subscribe((e) => {
            this.allEvents = e.length;
            this.statusCounts = {
                UPCOMING: e.filter((event) => event.status === 'UPCOMING')
                    .length,
                ONGOING: e.filter((event) => event.status === 'ONGOING').length,
                COMPLETED: e.filter((event) => event.status === 'COMPLETED')
                    .length,
                CANCELLED: e.filter((event) => event.status === 'CANCLLED')
                    .length,
            };
        });
    }

    getUserCount() {
        this.userService.query().subscribe((response) => {
            if (response.body) {
                const users = response.body;
    
                // Count users separately based on their roles
                const studentCount = users.filter((user: any) => 
                    user.authorities.includes('ROLE_STUDENT')
                ).length;
    
                const lectureCount = users.filter((user: any) => 
                    user.authorities.includes('ROLE_LECTURE')
                ).length;
    
                console.log('Student Count:', studentCount);
                console.log('Lecture Count:', lectureCount);
    
                // Assign counts to variables if needed for UI
                this.studentCount = studentCount;
                this.lectureCount = lectureCount;
            }
        });
    }
    
}
