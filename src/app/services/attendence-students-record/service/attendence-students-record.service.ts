import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { IAttendenceStudentsRecord, NewAttendenceStudentsRecord } from '../attendence-students-record.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateAttendenceStudentsRecord = Partial<IAttendenceStudentsRecord> & Pick<IAttendenceStudentsRecord, 'id'>;

export type EntityResponseType = HttpResponse<IAttendenceStudentsRecord>;
export type EntityArrayResponseType = HttpResponse<IAttendenceStudentsRecord[]>;

@Injectable({ providedIn: 'root' })
export class AttendenceStudentsRecordService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/attendence-students-records');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/attendence-students-records/_search');

  create(attendenceStudentsRecord: NewAttendenceStudentsRecord): Observable<EntityResponseType> {
    return this.http.post<IAttendenceStudentsRecord>(this.resourceUrl, attendenceStudentsRecord, { observe: 'response' });
  }

  update(attendenceStudentsRecord: IAttendenceStudentsRecord): Observable<EntityResponseType> {
    return this.http.put<IAttendenceStudentsRecord>(
      `${this.resourceUrl}/${this.getAttendenceStudentsRecordIdentifier(attendenceStudentsRecord)}`,
      attendenceStudentsRecord,
      { observe: 'response' },
    );
  }

  partialUpdate(attendenceStudentsRecord: PartialUpdateAttendenceStudentsRecord): Observable<EntityResponseType> {
    return this.http.patch<IAttendenceStudentsRecord>(
      `${this.resourceUrl}/${this.getAttendenceStudentsRecordIdentifier(attendenceStudentsRecord)}`,
      attendenceStudentsRecord,
      { observe: 'response' },
    );
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IAttendenceStudentsRecord>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAttendenceStudentsRecord[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAttendenceStudentsRecord[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAttendenceStudentsRecord[]>()], asapScheduler)));
  }

  getAttendenceStudentsRecordIdentifier(attendenceStudentsRecord: Pick<IAttendenceStudentsRecord, 'id'>): string {
    return attendenceStudentsRecord.id;
  }

  compareAttendenceStudentsRecord(
    o1: Pick<IAttendenceStudentsRecord, 'id'> | null,
    o2: Pick<IAttendenceStudentsRecord, 'id'> | null,
  ): boolean {
    return o1 && o2 ? this.getAttendenceStudentsRecordIdentifier(o1) === this.getAttendenceStudentsRecordIdentifier(o2) : o1 === o2;
  }

  addAttendenceStudentsRecordToCollectionIfMissing<Type extends Pick<IAttendenceStudentsRecord, 'id'>>(
    attendenceStudentsRecordCollection: Type[],
    ...attendenceStudentsRecordsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const attendenceStudentsRecords: Type[] = attendenceStudentsRecordsToCheck.filter(isPresent);
    if (attendenceStudentsRecords.length > 0) {
      const attendenceStudentsRecordCollectionIdentifiers = attendenceStudentsRecordCollection.map(attendenceStudentsRecordItem =>
        this.getAttendenceStudentsRecordIdentifier(attendenceStudentsRecordItem),
      );
      const attendenceStudentsRecordsToAdd = attendenceStudentsRecords.filter(attendenceStudentsRecordItem => {
        const attendenceStudentsRecordIdentifier = this.getAttendenceStudentsRecordIdentifier(attendenceStudentsRecordItem);
        if (attendenceStudentsRecordCollectionIdentifiers.includes(attendenceStudentsRecordIdentifier)) {
          return false;
        }
        attendenceStudentsRecordCollectionIdentifiers.push(attendenceStudentsRecordIdentifier);
        return true;
      });
      return [...attendenceStudentsRecordsToAdd, ...attendenceStudentsRecordCollection];
    }
    return attendenceStudentsRecordCollection;
  }
}
