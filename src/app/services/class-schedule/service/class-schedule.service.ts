import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';
import { catchError } from 'rxjs/operators';
import { IClassSchedule, NewClassSchedule } from '../class-schedule.model';

export type PartialUpdateClassSchedule = Partial<IClassSchedule> &
    Pick<IClassSchedule, 'id'>;

export type EntityResponseType = HttpResponse<IClassSchedule>;
export type EntityArrayResponseType = HttpResponse<IClassSchedule[]>;

@Injectable({ providedIn: 'root' })
export class ClassScheduleService {
    protected readonly http = inject(HttpClient);
    protected readonly applicationConfigService = inject(
        ApplicationConfigService
    );

    protected resourceUrl = this.applicationConfigService.getEndpointFor(
        'api/class-schedules'
    );
    protected resourceSearchUrl = this.applicationConfigService.getEndpointFor(
        'api/class-schedules/_search'
    );

    create(classSchedule: NewClassSchedule): Observable<EntityResponseType> {
        return this.http.post<IClassSchedule>(this.resourceUrl, classSchedule, {
            observe: 'response',
        });
    }

    update(classSchedule: IClassSchedule): Observable<EntityResponseType> {
        return this.http.put<IClassSchedule>(
            `${this.resourceUrl}/${this.getClassScheduleIdentifier(classSchedule)}`,
            classSchedule,
            {
                observe: 'response',
            }
        );
    }

    partialUpdate(
        classSchedule: PartialUpdateClassSchedule
    ): Observable<EntityResponseType> {
        return this.http.patch<IClassSchedule>(
            `${this.resourceUrl}/${this.getClassScheduleIdentifier(classSchedule)}`,
            classSchedule,
            {
                observe: 'response',
            }
        );
    }

    find(id: string): Observable<EntityResponseType> {
        return this.http.get<IClassSchedule>(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IClassSchedule[]>(this.resourceUrl, {
            params: options,
            observe: 'response',
        });
    }

    delete(id: string): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<
                IClassSchedule[]
            >(this.resourceSearchUrl, { params: options, observe: 'response' })
            .pipe(
                catchError(() =>
                    scheduled(
                        [new HttpResponse<IClassSchedule[]>()],
                        asapScheduler
                    )
                )
            );
    }

    getClassScheduleIdentifier(
        classSchedule: Pick<IClassSchedule, 'id'>
    ): string {
        return classSchedule.id;
    }

    compareClassSchedule(
        o1: Pick<IClassSchedule, 'id'> | null,
        o2: Pick<IClassSchedule, 'id'> | null
    ): boolean {
        return o1 && o2
            ? this.getClassScheduleIdentifier(o1) ===
                  this.getClassScheduleIdentifier(o2)
            : o1 === o2;
    }

    addClassScheduleToCollectionIfMissing<
        Type extends Pick<IClassSchedule, 'id'>,
    >(
        classScheduleCollection: Type[],
        ...classSchedulesToCheck: (Type | null | undefined)[]
    ): Type[] {
        const classSchedules: Type[] = classSchedulesToCheck.filter(isPresent);
        if (classSchedules.length > 0) {
            const classScheduleCollectionIdentifiers =
                classScheduleCollection.map((classScheduleItem) =>
                    this.getClassScheduleIdentifier(classScheduleItem)
                );
            const classSchedulesToAdd = classSchedules.filter(
                (classScheduleItem) => {
                    const classScheduleIdentifier =
                        this.getClassScheduleIdentifier(classScheduleItem);
                    if (
                        classScheduleCollectionIdentifiers.includes(
                            classScheduleIdentifier
                        )
                    ) {
                        return false;
                    }
                    classScheduleCollectionIdentifiers.push(
                        classScheduleIdentifier
                    );
                    return true;
                }
            );
            return [...classSchedulesToAdd, ...classScheduleCollection];
        }
        return classScheduleCollection;
    }
}
