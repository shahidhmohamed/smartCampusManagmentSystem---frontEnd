import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { environment } from 'environments/environment';
import { map, Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            map((navigation) => {
                // Filter navigation based on the user role
                const filteredNavigation = this.filterNavigationByRole(
                    navigation.default
                );
                this._navigation.next({
                    ...navigation,
                    default: filteredNavigation,
                });
                return navigation;
            })
        );
    }

    clearNavigation(): void {
        this._navigation.next({
            compact: [],
            default: [],
            futuristic: [],
            horizontal: [],
        });
    }

    private filterNavigationByRole(
        navigation: FuseNavigationItem[]
    ): FuseNavigationItem[] {
        const userRole = environment.role;

        return navigation.filter((item) => {
            if (item.id === 'admin' && userRole !== 'ROLE_ADMIN') {
                return false;
            }
            if (item.id === 'admin_events' && userRole !== 'ROLE_ADMIN')
                return false;

            if (item.id === 'lecture_event' && userRole !== 'ROLE_LECTURE')
                return false;

            if (
                item.id === 'lecture_resource_booking' &&
                userRole !== 'ROLE_LECTURE'
            )
                return false;

            if (
                item.id === 'admin_resource_booking' &&
                userRole !== 'ROLE_ADMIN'
            )
                return false;
            if (
                item.id === 'admin_user_management' &&
                userRole !== 'ROLE_ADMIN'
            )
                return false;
            if (item.id === 'course_management' && userRole !== 'ROLE_ADMIN')
                return false;

            if (item.id === 'admin_class_schedule' && userRole !== 'ROLE_ADMIN')
                return false;

            if (item.id === 'admin_file_manager' && userRole !== 'ROLE_ADMIN')
                return false;
            if (item.id === 'cource_manament' && userRole !== 'ROLE_ADMIN')
                return false;
            if (item.id === 'lecture' && userRole !== 'ROLE_LECTURE') {
                return false;
            }
            if (item.id === 'staff_attendence' && userRole !== 'ROLE_LECTURE') {
                return false;
            }
            if (
                item.id === 'lecture_filemanager' &&
                userRole !== 'ROLE_LECTURE'
            ) {
                return false;
            }
            if (item.id === 'student' && userRole !== 'ROLE_STUDENT') {
                return false;
            }

            if (
                item.id === 'student_filemanager' &&
                userRole !== 'ROLE_STUDENT'
            ) {
                return false;
            }
            if (
                item.id === 'student_assignments' &&
                userRole !== 'ROLE_STUDENT'
            ) {
                return false;
            }

            // if (
            //     item.id === 'student_filemanager' &&
            //     userRole !== 'ROLE_STUDENT'
            // ) {
            //     return false;
            // }

            if (item.id === 'student_event' && userRole !== 'ROLE_STUDENT') {
                return false;
            }

            if (
                item.id === 'student_resource_booking' &&
                userRole !== 'ROLE_STUDENT'
            ) {
                return false;
            }

            if (
                item.id === 'staff_assignments' &&
                userRole !== 'ROLE_LECTURE'
            ) {
                return false;
            }
            return true;
        });
    }
}
