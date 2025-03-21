/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageCommunicationService {
    private notificationeSource = new Subject<{
        topic: string;
        message: any;
        data?: any;
    }>();

    notificationAnnounced$ = this.notificationeSource.asObservable();

    public pushNotification(topic: string, message: any, data?: any) {
        console.log(`Broadcasting Notification:`, { topic, data });
        this.notificationeSource.next({ topic: topic, message: message, data });
    }
}
