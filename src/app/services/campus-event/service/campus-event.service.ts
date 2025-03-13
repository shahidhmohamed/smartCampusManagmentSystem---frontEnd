import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';
import { ICampusEvent, NewCampusEvent } from '../campus-event.model';

export type PartialUpdateCampusEvent = Partial<ICampusEvent> &
    Pick<ICampusEvent, 'id'>;

type RestOf<T extends ICampusEvent | NewCampusEvent> = Omit<T, 'eventDate'> & {
    eventDate?: string | null;
};

export type RestCampusEvent = RestOf<ICampusEvent>;

export type NewRestCampusEvent = RestOf<NewCampusEvent>;

export type PartialUpdateRestCampusEvent = RestOf<PartialUpdateCampusEvent>;

export type EntityResponseType = HttpResponse<ICampusEvent>;
export type EntityArrayResponseType = HttpResponse<ICampusEvent[]>;

export interface Event {
    id?: string;
    eventName?: string;
    description?: string;
    eventDate?: dayjs.Dayjs;
    location?: string;
    organizerId?: string;
    eventType?: string;
    capacity?: number;
    status?: '';
}

@Injectable({ providedIn: 'root' })
export class CampusEventService {
    protected readonly http = inject(HttpClient);
    protected readonly applicationConfigService = inject(
        ApplicationConfigService
    );

    protected resourceUrl =
        this.applicationConfigService.getEndpointFor('api/campus-events');
    protected resourceSearchUrl = this.applicationConfigService.getEndpointFor(
        'api/campus-events/_search'
    );

    create(campusEvent: NewCampusEvent): Observable<EntityResponseType> {
        return this.http.post<ICampusEvent>(this.resourceUrl, campusEvent, {
            observe: 'response',
        });
    }
    getAllItems(): Observable<ICampusEvent[]> {
        return this.http.get<ICampusEvent[]>(this.resourceUrl);
    }

    getAllItemsSearch(
        query: string = '*',
        page: number = 0,
        size: number = 10
    ): Observable<HttpResponse<ICampusEvent[]>> {
        return this.http.get<ICampusEvent[]>(
            this.resourceUrl + `/_search?query=${query}&page=${page}&size=${size}`,
            { observe: 'response' }
        );
    }

    // Create a new inventory item
    createEvent(event: Event): Observable<ICampusEvent> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post<ICampusEvent>(this.resourceUrl, event, {
            headers,
        });
    }

    update(campusEvent: ICampusEvent): Observable<EntityResponseType> {
        return this.http.put<ICampusEvent>(
            `${this.resourceUrl}/${this.getCampusEventIdentifier(campusEvent)}`,
            campusEvent,
            {
                observe: 'response',
            }
        );
    }

    partialUpdate(
        campusEvent: PartialUpdateCampusEvent
    ): Observable<EntityResponseType> {
        return this.http.patch<ICampusEvent>(
            `${this.resourceUrl}/${this.getCampusEventIdentifier(campusEvent)}`,
            campusEvent,
            {
                observe: 'response',
            }
        );
    }

    find(id: string): Observable<EntityResponseType> {
        return this.http.get<ICampusEvent>(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<ICampusEvent[]>(this.resourceUrl, {
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
                ICampusEvent[]
            >(this.resourceSearchUrl, { params: options, observe: 'response' })
            .pipe(
                catchError(() =>
                    scheduled(
                        [new HttpResponse<ICampusEvent[]>()],
                        asapScheduler
                    )
                )
            );
    }

    getCampusEventIdentifier(campusEvent: Pick<ICampusEvent, 'id'>): string {
        return campusEvent.id;
    }

    compareCampusEvent(
        o1: Pick<ICampusEvent, 'id'> | null,
        o2: Pick<ICampusEvent, 'id'> | null
    ): boolean {
        return o1 && o2
            ? this.getCampusEventIdentifier(o1) ===
                  this.getCampusEventIdentifier(o2)
            : o1 === o2;
    }

    addCampusEventToCollectionIfMissing<Type extends Pick<ICampusEvent, 'id'>>(
        campusEventCollection: Type[],
        ...campusEventsToCheck: (Type | null | undefined)[]
    ): Type[] {
        const campusEvents: Type[] = campusEventsToCheck.filter(isPresent);
        if (campusEvents.length > 0) {
            const campusEventCollectionIdentifiers = campusEventCollection.map(
                (campusEventItem) =>
                    this.getCampusEventIdentifier(campusEventItem)
            );
            const campusEventsToAdd = campusEvents.filter((campusEventItem) => {
                const campusEventIdentifier =
                    this.getCampusEventIdentifier(campusEventItem);
                if (
                    campusEventCollectionIdentifiers.includes(
                        campusEventIdentifier
                    )
                ) {
                    return false;
                }
                campusEventCollectionIdentifiers.push(campusEventIdentifier);
                return true;
            });
            return [...campusEventsToAdd, ...campusEventCollection];
        }
        return campusEventCollection;
    }
}
