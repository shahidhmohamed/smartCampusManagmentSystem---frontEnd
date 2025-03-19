import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { IAttendence, NewAttendence } from '../attendence.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateAttendence = Partial<IAttendence> & Pick<IAttendence, 'id'>;

export type EntityResponseType = HttpResponse<IAttendence>;
export type EntityArrayResponseType = HttpResponse<IAttendence[]>;

@Injectable({ providedIn: 'root' })
export class AttendenceService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/attendences');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/attendences/_search');

  create(attendence: NewAttendence): Observable<EntityResponseType> {
    return this.http.post<IAttendence>(this.resourceUrl, attendence, { observe: 'response' });
  }

  update(attendence: IAttendence): Observable<EntityResponseType> {
    return this.http.put<IAttendence>(`${this.resourceUrl}/${this.getAttendenceIdentifier(attendence)}`, attendence, {
      observe: 'response',
    });
  }

  partialUpdate(attendence: PartialUpdateAttendence): Observable<EntityResponseType> {
    return this.http.patch<IAttendence>(`${this.resourceUrl}/${this.getAttendenceIdentifier(attendence)}`, attendence, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IAttendence>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAttendence[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAttendence[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAttendence[]>()], asapScheduler)));
  }

  getAttendenceIdentifier(attendence: Pick<IAttendence, 'id'>): string {
    return attendence.id;
  }

  compareAttendence(o1: Pick<IAttendence, 'id'> | null, o2: Pick<IAttendence, 'id'> | null): boolean {
    return o1 && o2 ? this.getAttendenceIdentifier(o1) === this.getAttendenceIdentifier(o2) : o1 === o2;
  }

  addAttendenceToCollectionIfMissing<Type extends Pick<IAttendence, 'id'>>(
    attendenceCollection: Type[],
    ...attendencesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const attendences: Type[] = attendencesToCheck.filter(isPresent);
    if (attendences.length > 0) {
      const attendenceCollectionIdentifiers = attendenceCollection.map(attendenceItem => this.getAttendenceIdentifier(attendenceItem));
      const attendencesToAdd = attendences.filter(attendenceItem => {
        const attendenceIdentifier = this.getAttendenceIdentifier(attendenceItem);
        if (attendenceCollectionIdentifiers.includes(attendenceIdentifier)) {
          return false;
        }
        attendenceCollectionIdentifiers.push(attendenceIdentifier);
        return true;
      });
      return [...attendencesToAdd, ...attendenceCollection];
    }
    return attendenceCollection;
  }
}
