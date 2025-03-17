import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { IMessage, NewMessage } from '../message.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateMessage = Partial<IMessage> & Pick<IMessage, 'id'>;

export type EntityResponseType = HttpResponse<IMessage>;
export type EntityArrayResponseType = HttpResponse<IMessage[]>;

@Injectable({ providedIn: 'root' })
export class MessageService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/messages');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/messages/_search');

  create(message: NewMessage): Observable<EntityResponseType> {
    return this.http.post<IMessage>(this.resourceUrl, message, { observe: 'response' });
  }

  update(message: IMessage): Observable<EntityResponseType> {
    return this.http.put<IMessage>(`${this.resourceUrl}/${this.getMessageIdentifier(message)}`, message, { observe: 'response' });
  }

  partialUpdate(message: PartialUpdateMessage): Observable<EntityResponseType> {
    return this.http.patch<IMessage>(`${this.resourceUrl}/${this.getMessageIdentifier(message)}`, message, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IMessage>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMessage[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IMessage[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IMessage[]>()], asapScheduler)));
  }

  getMessageIdentifier(message: Pick<IMessage, 'id'>): string {
    return message.id;
  }

  compareMessage(o1: Pick<IMessage, 'id'> | null, o2: Pick<IMessage, 'id'> | null): boolean {
    return o1 && o2 ? this.getMessageIdentifier(o1) === this.getMessageIdentifier(o2) : o1 === o2;
  }

  addMessageToCollectionIfMissing<Type extends Pick<IMessage, 'id'>>(
    messageCollection: Type[],
    ...messagesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const messages: Type[] = messagesToCheck.filter(isPresent);
    if (messages.length > 0) {
      const messageCollectionIdentifiers = messageCollection.map(messageItem => this.getMessageIdentifier(messageItem));
      const messagesToAdd = messages.filter(messageItem => {
        const messageIdentifier = this.getMessageIdentifier(messageItem);
        if (messageCollectionIdentifiers.includes(messageIdentifier)) {
          return false;
        }
        messageCollectionIdentifiers.push(messageIdentifier);
        return true;
      });
      return [...messagesToAdd, ...messageCollection];
    }
    return messageCollection;
  }
}
