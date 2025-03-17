import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { IGroupChat, NewGroupChat } from '../group-chat.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateGroupChat = Partial<IGroupChat> & Pick<IGroupChat, 'id'>;

export type EntityResponseType = HttpResponse<IGroupChat>;
export type EntityArrayResponseType = HttpResponse<IGroupChat[]>;

@Injectable({ providedIn: 'root' })
export class GroupChatService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/group-chats');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/group-chats/_search');

  create(groupChat: NewGroupChat): Observable<EntityResponseType> {
    return this.http.post<IGroupChat>(this.resourceUrl, groupChat, { observe: 'response' });
  }

  update(groupChat: IGroupChat): Observable<EntityResponseType> {
    return this.http.put<IGroupChat>(`${this.resourceUrl}/${this.getGroupChatIdentifier(groupChat)}`, groupChat, { observe: 'response' });
  }

  partialUpdate(groupChat: PartialUpdateGroupChat): Observable<EntityResponseType> {
    return this.http.patch<IGroupChat>(`${this.resourceUrl}/${this.getGroupChatIdentifier(groupChat)}`, groupChat, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IGroupChat>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IGroupChat[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IGroupChat[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IGroupChat[]>()], asapScheduler)));
  }

  getGroupChatIdentifier(groupChat: Pick<IGroupChat, 'id'>): string {
    return groupChat.id;
  }

  compareGroupChat(o1: Pick<IGroupChat, 'id'> | null, o2: Pick<IGroupChat, 'id'> | null): boolean {
    return o1 && o2 ? this.getGroupChatIdentifier(o1) === this.getGroupChatIdentifier(o2) : o1 === o2;
  }

  addGroupChatToCollectionIfMissing<Type extends Pick<IGroupChat, 'id'>>(
    groupChatCollection: Type[],
    ...groupChatsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const groupChats: Type[] = groupChatsToCheck.filter(isPresent);
    if (groupChats.length > 0) {
      const groupChatCollectionIdentifiers = groupChatCollection.map(groupChatItem => this.getGroupChatIdentifier(groupChatItem));
      const groupChatsToAdd = groupChats.filter(groupChatItem => {
        const groupChatIdentifier = this.getGroupChatIdentifier(groupChatItem);
        if (groupChatCollectionIdentifiers.includes(groupChatIdentifier)) {
          return false;
        }
        groupChatCollectionIdentifiers.push(groupChatIdentifier);
        return true;
      });
      return [...groupChatsToAdd, ...groupChatCollection];
    }
    return groupChatCollection;
  }
}
