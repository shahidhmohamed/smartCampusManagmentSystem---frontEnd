import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';
import { catchError } from 'rxjs/operators';
import {
    IResourceBooking,
    NewResourceBooking,
} from '../resource-booking.model';

export type PartialUpdateResourceBooking = Partial<IResourceBooking> &
    Pick<IResourceBooking, 'id'>;

export type EntityResponseType = HttpResponse<IResourceBooking>;
export type EntityArrayResponseType = HttpResponse<IResourceBooking[]>;

@Injectable({ providedIn: 'root' })
export class ResourceBookingService {
    protected readonly http = inject(HttpClient);
    protected readonly applicationConfigService = inject(
        ApplicationConfigService
    );

    protected resourceUrl = this.applicationConfigService.getEndpointFor(
        'api/resource-bookings'
    );
    protected resourceSearchUrl = this.applicationConfigService.getEndpointFor(
        'api/resource-bookings/_search'
    );

    create(
        resourceBooking: NewResourceBooking
    ): Observable<EntityResponseType> {
        return this.http.post<IResourceBooking>(
            this.resourceUrl,
            resourceBooking,
            { observe: 'response' }
        );
    }

    update(resourceBooking: IResourceBooking): Observable<EntityResponseType> {
        return this.http.put<IResourceBooking>(
            `${this.resourceUrl}/${this.getResourceBookingIdentifier(resourceBooking)}`,
            resourceBooking,
            {
                observe: 'response',
            }
        );
    }

    partialUpdate(
        resourceBooking: PartialUpdateResourceBooking
    ): Observable<EntityResponseType> {
        return this.http.patch<IResourceBooking>(
            `${this.resourceUrl}/${this.getResourceBookingIdentifier(resourceBooking)}`,
            resourceBooking,
            {
                observe: 'response',
            }
        );
    }

    find(id: string): Observable<EntityResponseType> {
        return this.http.get<IResourceBooking>(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IResourceBooking[]>(this.resourceUrl, {
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
                IResourceBooking[]
            >(this.resourceSearchUrl, { params: options, observe: 'response' })
            .pipe(
                catchError(() =>
                    scheduled(
                        [new HttpResponse<IResourceBooking[]>()],
                        asapScheduler
                    )
                )
            );
    }

    getResourceBookingIdentifier(
        resourceBooking: Pick<IResourceBooking, 'id'>
    ): string {
        return resourceBooking.id;
    }

    compareResourceBooking(
        o1: Pick<IResourceBooking, 'id'> | null,
        o2: Pick<IResourceBooking, 'id'> | null
    ): boolean {
        return o1 && o2
            ? this.getResourceBookingIdentifier(o1) ===
                  this.getResourceBookingIdentifier(o2)
            : o1 === o2;
    }

    addResourceBookingToCollectionIfMissing<
        Type extends Pick<IResourceBooking, 'id'>,
    >(
        resourceBookingCollection: Type[],
        ...resourceBookingsToCheck: (Type | null | undefined)[]
    ): Type[] {
        const resourceBookings: Type[] =
            resourceBookingsToCheck.filter(isPresent);
        if (resourceBookings.length > 0) {
            const resourceBookingCollectionIdentifiers =
                resourceBookingCollection.map((resourceBookingItem) =>
                    this.getResourceBookingIdentifier(resourceBookingItem)
                );
            const resourceBookingsToAdd = resourceBookings.filter(
                (resourceBookingItem) => {
                    const resourceBookingIdentifier =
                        this.getResourceBookingIdentifier(resourceBookingItem);
                    if (
                        resourceBookingCollectionIdentifiers.includes(
                            resourceBookingIdentifier
                        )
                    ) {
                        return false;
                    }
                    resourceBookingCollectionIdentifiers.push(
                        resourceBookingIdentifier
                    );
                    return true;
                }
            );
            return [...resourceBookingsToAdd, ...resourceBookingCollection];
        }
        return resourceBookingCollection;
    }
}
