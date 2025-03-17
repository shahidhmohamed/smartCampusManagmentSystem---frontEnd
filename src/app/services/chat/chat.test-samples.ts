import { IChat, NewChat } from './chat.model';

export const sampleWithRequiredData: IChat = {
  id: '71d8c6c7-0904-468e-bc43-c270801860d0',
};

export const sampleWithPartialData: IChat = {
  id: '6da974b3-07e9-4b48-9bce-5fb503523c74',
  title: 'pish unto hunger',
  createdAt: 'mostly whenever aw',
};

export const sampleWithFullData: IChat = {
  id: 'd26d9d2d-dbdd-41a9-9ed5-828e27930cf7',
  contactId: 'considering ameliorate petal',
  contact: 'where kosher digit',
  unreadCount: 'clamp progress',
  muted: true,
  title: 'nor',
  type: 'amid',
  createdAt: 'as at',
  owner: 'cardboard gee',
};

export const sampleWithNewData: NewChat = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
