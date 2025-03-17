import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { IGroupChatMembers, NewGroupChatMembers } from '../group-chat-members.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateGroupChatMembers = Partial<IGroupChatMembers> & Pick<IGroupChatMembers, 'id'>;

export type EntityResponseType = HttpResponse<IGroupChatMembers>;
export type EntityArrayResponseType = HttpResponse<IGroupChatMembers[]>;

@Injectable({ providedIn: 'root' })
export class GroupChatMembersService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/group-chat-members');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/group-chat-members/_search');

  create(groupChatMembers: NewGroupChatMembers): Observable<EntityResponseType> {
    return this.http.post<IGroupChatMembers>(this.resourceUrl, groupChatMembers, { observe: 'response' });
  }

  update(groupChatMembers: IGroupChatMembers): Observable<EntityResponseType> {
    return this.http.put<IGroupChatMembers>(
      `${this.resourceUrl}/${this.getGroupChatMembersIdentifier(groupChatMembers)}`,
      groupChatMembers,
      { observe: 'response' },
    );
  }

  partialUpdate(groupChatMembers: PartialUpdateGroupChatMembers): Observable<EntityResponseType> {
    return this.http.patch<IGroupChatMembers>(
      `${this.resourceUrl}/${this.getGroupChatMembersIdentifier(groupChatMembers)}`,
      groupChatMembers,
      { observe: 'response' },
    );
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IGroupChatMembers>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IGroupChatMembers[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IGroupChatMembers[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IGroupChatMembers[]>()], asapScheduler)));
  }

  getGroupChatMembersIdentifier(groupChatMembers: Pick<IGroupChatMembers, 'id'>): string {
    return groupChatMembers.id;
  }

  compareGroupChatMembers(o1: Pick<IGroupChatMembers, 'id'> | null, o2: Pick<IGroupChatMembers, 'id'> | null): boolean {
    return o1 && o2 ? this.getGroupChatMembersIdentifier(o1) === this.getGroupChatMembersIdentifier(o2) : o1 === o2;
  }

  addGroupChatMembersToCollectionIfMissing<Type extends Pick<IGroupChatMembers, 'id'>>(
    groupChatMembersCollection: Type[],
    ...groupChatMembersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const groupChatMembers: Type[] = groupChatMembersToCheck.filter(isPresent);
    if (groupChatMembers.length > 0) {
      const groupChatMembersCollectionIdentifiers = groupChatMembersCollection.map(groupChatMembersItem =>
        this.getGroupChatMembersIdentifier(groupChatMembersItem),
      );
      const groupChatMembersToAdd = groupChatMembers.filter(groupChatMembersItem => {
        const groupChatMembersIdentifier = this.getGroupChatMembersIdentifier(groupChatMembersItem);
        if (groupChatMembersCollectionIdentifiers.includes(groupChatMembersIdentifier)) {
          return false;
        }
        groupChatMembersCollectionIdentifiers.push(groupChatMembersIdentifier);
        return true;
      });
      return [...groupChatMembersToAdd, ...groupChatMembersCollection];
    }
    return groupChatMembersCollection;
  }
}
