import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { ICourseRegistration, NewCourseRegistration } from '../course-registration.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateCourseRegistration = Partial<ICourseRegistration> & Pick<ICourseRegistration, 'id'>;

export type EntityResponseType = HttpResponse<ICourseRegistration>;
export type EntityArrayResponseType = HttpResponse<ICourseRegistration[]>;

@Injectable({ providedIn: 'root' })
export class CourseRegistrationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/course-registrations');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/course-registrations/_search');

  create(courseRegistration: NewCourseRegistration): Observable<EntityResponseType> {
    return this.http.post<ICourseRegistration>(this.resourceUrl, courseRegistration, { observe: 'response' });
  }

  update(courseRegistration: ICourseRegistration): Observable<EntityResponseType> {
    return this.http.put<ICourseRegistration>(
      `${this.resourceUrl}/${this.getCourseRegistrationIdentifier(courseRegistration)}`,
      courseRegistration,
      { observe: 'response' },
    );
  }

  partialUpdate(courseRegistration: PartialUpdateCourseRegistration): Observable<EntityResponseType> {
    return this.http.patch<ICourseRegistration>(
      `${this.resourceUrl}/${this.getCourseRegistrationIdentifier(courseRegistration)}`,
      courseRegistration,
      { observe: 'response' },
    );
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<ICourseRegistration>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ICourseRegistration[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ICourseRegistration[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<ICourseRegistration[]>()], asapScheduler)));
  }

  getCourseRegistrationIdentifier(courseRegistration: Pick<ICourseRegistration, 'id'>): string {
    return courseRegistration.id;
  }

  compareCourseRegistration(o1: Pick<ICourseRegistration, 'id'> | null, o2: Pick<ICourseRegistration, 'id'> | null): boolean {
    return o1 && o2 ? this.getCourseRegistrationIdentifier(o1) === this.getCourseRegistrationIdentifier(o2) : o1 === o2;
  }

  addCourseRegistrationToCollectionIfMissing<Type extends Pick<ICourseRegistration, 'id'>>(
    courseRegistrationCollection: Type[],
    ...courseRegistrationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const courseRegistrations: Type[] = courseRegistrationsToCheck.filter(isPresent);
    if (courseRegistrations.length > 0) {
      const courseRegistrationCollectionIdentifiers = courseRegistrationCollection.map(courseRegistrationItem =>
        this.getCourseRegistrationIdentifier(courseRegistrationItem),
      );
      const courseRegistrationsToAdd = courseRegistrations.filter(courseRegistrationItem => {
        const courseRegistrationIdentifier = this.getCourseRegistrationIdentifier(courseRegistrationItem);
        if (courseRegistrationCollectionIdentifiers.includes(courseRegistrationIdentifier)) {
          return false;
        }
        courseRegistrationCollectionIdentifiers.push(courseRegistrationIdentifier);
        return true;
      });
      return [...courseRegistrationsToAdd, ...courseRegistrationCollection];
    }
    return courseRegistrationCollection;
  }
}
