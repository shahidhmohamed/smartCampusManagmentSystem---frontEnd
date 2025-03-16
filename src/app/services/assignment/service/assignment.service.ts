import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { IAssignment, NewAssignment } from '../assignment.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { Search, SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateAssignment = Partial<IAssignment> & Pick<IAssignment, 'id'>;

export type EntityResponseType = HttpResponse<IAssignment>;
export type EntityArrayResponseType = HttpResponse<IAssignment[]>;

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/assignments');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/assignments/_search');

  create(assignment: NewAssignment): Observable<EntityResponseType> {
    return this.http.post<IAssignment>(this.resourceUrl, assignment, { observe: 'response' });
  }

  update(assignment: IAssignment): Observable<EntityResponseType> {
    return this.http.put<IAssignment>(`${this.resourceUrl}/${this.getAssignmentIdentifier(assignment)}`, assignment, {
      observe: 'response',
    });
  }

  partialUpdate(assignment: PartialUpdateAssignment): Observable<EntityResponseType> {
    return this.http.patch<IAssignment>(`${this.resourceUrl}/${this.getAssignmentIdentifier(assignment)}`, assignment, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IAssignment>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAssignment[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAssignment[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAssignment[]>()], asapScheduler)));
  }

  getAssignmentIdentifier(assignment: Pick<IAssignment, 'id'>): string {
    return assignment.id;
  }

  compareAssignment(o1: Pick<IAssignment, 'id'> | null, o2: Pick<IAssignment, 'id'> | null): boolean {
    return o1 && o2 ? this.getAssignmentIdentifier(o1) === this.getAssignmentIdentifier(o2) : o1 === o2;
  }

  addAssignmentToCollectionIfMissing<Type extends Pick<IAssignment, 'id'>>(
    assignmentCollection: Type[],
    ...assignmentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const assignments: Type[] = assignmentsToCheck.filter(isPresent);
    if (assignments.length > 0) {
      const assignmentCollectionIdentifiers = assignmentCollection.map(assignmentItem => this.getAssignmentIdentifier(assignmentItem));
      const assignmentsToAdd = assignments.filter(assignmentItem => {
        const assignmentIdentifier = this.getAssignmentIdentifier(assignmentItem);
        if (assignmentCollectionIdentifiers.includes(assignmentIdentifier)) {
          return false;
        }
        assignmentCollectionIdentifiers.push(assignmentIdentifier);
        return true;
      });
      return [...assignmentsToAdd, ...assignmentCollection];
    }
    return assignmentCollection;
  }
}

