import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { IAssignmentFile, NewAssignmentFile } from '../assignment-file.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateAssignmentFile = Partial<IAssignmentFile> & Pick<IAssignmentFile, 'id'>;

export type EntityResponseType = HttpResponse<IAssignmentFile>;
export type EntityArrayResponseType = HttpResponse<IAssignmentFile[]>;

@Injectable({ providedIn: 'root' })
export class AssignmentFileService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/assignment-files');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/assignment-files/_search');

  create(assignmentFile: NewAssignmentFile): Observable<EntityResponseType> {
    return this.http.post<IAssignmentFile>(this.resourceUrl, assignmentFile, { observe: 'response' });
  }

  update(assignmentFile: IAssignmentFile): Observable<EntityResponseType> {
    return this.http.put<IAssignmentFile>(`${this.resourceUrl}/${this.getAssignmentFileIdentifier(assignmentFile)}`, assignmentFile, {
      observe: 'response',
    });
  }

  partialUpdate(assignmentFile: PartialUpdateAssignmentFile): Observable<EntityResponseType> {
    return this.http.patch<IAssignmentFile>(`${this.resourceUrl}/${this.getAssignmentFileIdentifier(assignmentFile)}`, assignmentFile, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IAssignmentFile>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAssignmentFile[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAssignmentFile[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAssignmentFile[]>()], asapScheduler)));
  }

  getAssignmentFileIdentifier(assignmentFile: Pick<IAssignmentFile, 'id'>): string {
    return assignmentFile.id;
  }

  compareAssignmentFile(o1: Pick<IAssignmentFile, 'id'> | null, o2: Pick<IAssignmentFile, 'id'> | null): boolean {
    return o1 && o2 ? this.getAssignmentFileIdentifier(o1) === this.getAssignmentFileIdentifier(o2) : o1 === o2;
  }

  addAssignmentFileToCollectionIfMissing<Type extends Pick<IAssignmentFile, 'id'>>(
    assignmentFileCollection: Type[],
    ...assignmentFilesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const assignmentFiles: Type[] = assignmentFilesToCheck.filter(isPresent);
    if (assignmentFiles.length > 0) {
      const assignmentFileCollectionIdentifiers = assignmentFileCollection.map(assignmentFileItem =>
        this.getAssignmentFileIdentifier(assignmentFileItem),
      );
      const assignmentFilesToAdd = assignmentFiles.filter(assignmentFileItem => {
        const assignmentFileIdentifier = this.getAssignmentFileIdentifier(assignmentFileItem);
        if (assignmentFileCollectionIdentifiers.includes(assignmentFileIdentifier)) {
          return false;
        }
        assignmentFileCollectionIdentifiers.push(assignmentFileIdentifier);
        return true;
      });
      return [...assignmentFilesToAdd, ...assignmentFileCollection];
    }
    return assignmentFileCollection;
  }
}
