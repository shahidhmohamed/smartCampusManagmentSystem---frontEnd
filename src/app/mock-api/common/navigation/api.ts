import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import {
    compactNavigation,
    defaultNavigation,
    futuristicNavigation,
    horizontalNavigation,
} from 'app/mock-api/common/navigation/data';
import { environment } from 'environments/environment';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
    private readonly _compactNavigation: FuseNavigationItem[] =
        compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] =
        defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] =
        futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] =
        horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            const userRole = environment.role;

            // Filter navigation items
            const filteredNavigation = defaultNavigation.filter((item) => {
                if (item.id === 'admin' && userRole !== 'ROLE_ADMIN')
                    return false;
                if (item.id === 'admin_events' && userRole !== 'ROLE_ADMIN')
                    return false;

                if (item.id === 'lecture' && userRole !== 'ROLE_LECTURE')
                    return false;
                if (item.id === 'student' && userRole !== 'ROLE_STUDENT')
                    return false;
                return true;
            });

            return [
                200,
                {
                    compact: cloneDeep(filteredNavigation),
                    default: cloneDeep(filteredNavigation),
                    futuristic: cloneDeep(filteredNavigation),
                    horizontal: cloneDeep(filteredNavigation),
                },
            ];
        });
    }
}
