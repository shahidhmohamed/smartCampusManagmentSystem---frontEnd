/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageCommunicationService {
 
  private notificationeSource = new Subject<{ topic: string; message: any }>();

  notificationAnnounced$ = this.notificationeSource.asObservable();

  public pushNotification(topic: string, message: any) {
    this.notificationeSource.next({ topic: topic, message: message });
  }
}
