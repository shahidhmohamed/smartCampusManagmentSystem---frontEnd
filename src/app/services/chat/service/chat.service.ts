import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { IChat, NewChat } from '../chat.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateChat = Partial<IChat> & Pick<IChat, 'id'>;

export type EntityResponseType = HttpResponse<IChat>;
export type EntityArrayResponseType = HttpResponse<IChat[]>;

@Injectable({ providedIn: 'root' })
export class ChatService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/chats');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/chats/_search');

  create(chat: NewChat): Observable<EntityResponseType> {
    return this.http.post<IChat>(this.resourceUrl, chat, { observe: 'response' });
  }

  update(chat: IChat): Observable<EntityResponseType> {
    return this.http.put<IChat>(`${this.resourceUrl}/${this.getChatIdentifier(chat)}`, chat, { observe: 'response' });
  }

  partialUpdate(chat: PartialUpdateChat): Observable<EntityResponseType> {
    return this.http.patch<IChat>(`${this.resourceUrl}/${this.getChatIdentifier(chat)}`, chat, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IChat>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IChat[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IChat[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IChat[]>()], asapScheduler)));
  }

  getChatIdentifier(chat: Pick<IChat, 'id'>): string {
    return chat.id;
  }

  compareChat(o1: Pick<IChat, 'id'> | null, o2: Pick<IChat, 'id'> | null): boolean {
    return o1 && o2 ? this.getChatIdentifier(o1) === this.getChatIdentifier(o2) : o1 === o2;
  }

  addChatToCollectionIfMissing<Type extends Pick<IChat, 'id'>>(
    chatCollection: Type[],
    ...chatsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const chats: Type[] = chatsToCheck.filter(isPresent);
    if (chats.length > 0) {
      const chatCollectionIdentifiers = chatCollection.map(chatItem => this.getChatIdentifier(chatItem));
      const chatsToAdd = chats.filter(chatItem => {
        const chatIdentifier = this.getChatIdentifier(chatItem);
        if (chatCollectionIdentifiers.includes(chatIdentifier)) {
          return false;
        }
        chatCollectionIdentifiers.push(chatIdentifier);
        return true;
      });
      return [...chatsToAdd, ...chatCollection];
    }
    return chatCollection;
  }
}
