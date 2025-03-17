import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { IChatUser, NewChatUser } from '../chat-user.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateChatUser = Partial<IChatUser> & Pick<IChatUser, 'id'>;

export type EntityResponseType = HttpResponse<IChatUser>;
export type EntityArrayResponseType = HttpResponse<IChatUser[]>;

@Injectable({ providedIn: 'root' })
export class ChatUserService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/chat-users');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/chat-users/_search');

  create(chatUser: NewChatUser): Observable<EntityResponseType> {
    return this.http.post<IChatUser>(this.resourceUrl, chatUser, { observe: 'response' });
  }

  update(chatUser: IChatUser): Observable<EntityResponseType> {
    return this.http.put<IChatUser>(`${this.resourceUrl}/${this.getChatUserIdentifier(chatUser)}`, chatUser, { observe: 'response' });
  }

  partialUpdate(chatUser: PartialUpdateChatUser): Observable<EntityResponseType> {
    return this.http.patch<IChatUser>(`${this.resourceUrl}/${this.getChatUserIdentifier(chatUser)}`, chatUser, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IChatUser>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IChatUser[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IChatUser[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IChatUser[]>()], asapScheduler)));
  }

  getChatUserIdentifier(chatUser: Pick<IChatUser, 'id'>): string {
    return chatUser.id;
  }

  compareChatUser(o1: Pick<IChatUser, 'id'> | null, o2: Pick<IChatUser, 'id'> | null): boolean {
    return o1 && o2 ? this.getChatUserIdentifier(o1) === this.getChatUserIdentifier(o2) : o1 === o2;
  }

  addChatUserToCollectionIfMissing<Type extends Pick<IChatUser, 'id'>>(
    chatUserCollection: Type[],
    ...chatUsersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const chatUsers: Type[] = chatUsersToCheck.filter(isPresent);
    if (chatUsers.length > 0) {
      const chatUserCollectionIdentifiers = chatUserCollection.map(chatUserItem => this.getChatUserIdentifier(chatUserItem));
      const chatUsersToAdd = chatUsers.filter(chatUserItem => {
        const chatUserIdentifier = this.getChatUserIdentifier(chatUserItem);
        if (chatUserCollectionIdentifiers.includes(chatUserIdentifier)) {
          return false;
        }
        chatUserCollectionIdentifiers.push(chatUserIdentifier);
        return true;
      });
      return [...chatUsersToAdd, ...chatUserCollection];
    }
    return chatUserCollection;
  }
}
