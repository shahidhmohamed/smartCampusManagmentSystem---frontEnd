import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { ICourse, NewCourse } from '../course.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateCourse = Partial<ICourse> & Pick<ICourse, 'id'>;

export type EntityResponseType = HttpResponse<ICourse>;
export type EntityArrayResponseType = HttpResponse<ICourse[]>;

@Injectable({ providedIn: 'root' })
export class CourseService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/courses');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/courses/_search');

  create(course: NewCourse): Observable<EntityResponseType> {
    return this.http.post<ICourse>(this.resourceUrl, course, { observe: 'response' });
  }

  update(course: ICourse): Observable<EntityResponseType> {
    return this.http.put<ICourse>(`${this.resourceUrl}/${this.getCourseIdentifier(course)}`, course, { observe: 'response' });
  }

  partialUpdate(course: PartialUpdateCourse): Observable<EntityResponseType> {
    return this.http.patch<ICourse>(`${this.resourceUrl}/${this.getCourseIdentifier(course)}`, course, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<ICourse>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ICourse[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ICourse[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<ICourse[]>()], asapScheduler)));
  }

  getCourseIdentifier(course: Pick<ICourse, 'id'>): string {
    return course.id;
  }

  compareCourse(o1: Pick<ICourse, 'id'> | null, o2: Pick<ICourse, 'id'> | null): boolean {
    return o1 && o2 ? this.getCourseIdentifier(o1) === this.getCourseIdentifier(o2) : o1 === o2;
  }

  addCourseToCollectionIfMissing<Type extends Pick<ICourse, 'id'>>(
    courseCollection: Type[],
    ...coursesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const courses: Type[] = coursesToCheck.filter(isPresent);
    if (courses.length > 0) {
      const courseCollectionIdentifiers = courseCollection.map(courseItem => this.getCourseIdentifier(courseItem));
      const coursesToAdd = courses.filter(courseItem => {
        const courseIdentifier = this.getCourseIdentifier(courseItem);
        if (courseCollectionIdentifiers.includes(courseIdentifier)) {
          return false;
        }
        courseCollectionIdentifiers.push(courseIdentifier);
        return true;
      });
      return [...coursesToAdd, ...courseCollection];
    }
    return courseCollection;
  }
}
