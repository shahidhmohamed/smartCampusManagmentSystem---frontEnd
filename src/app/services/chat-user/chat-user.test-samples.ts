import { IChatUser, NewChatUser } from './chat-user.model';

export const sampleWithRequiredData: IChatUser = {
  id: '4c6ea329-92e4-4557-a46d-0dbb87338664',
};

export const sampleWithPartialData: IChatUser = {
  id: '2fd309ac-dd29-456f-b738-558c8ba480e5',
  avatar: 'that low',
  name: 'successfully amidst gripping',
  title: 'boyfriend out collaborate',
};

export const sampleWithFullData: IChatUser = {
  id: '238d5050-874a-4166-825f-d5ad50e450cc',
  avatar: 'till',
  name: 'ack',
  about: 'only coolly',
  title: 'since oxidize',
  birthday: 'selfish yum pigsty',
  address: 'symbolise trust where',
  phoneNumber: 'yahoo vaguely cap',
};

export const sampleWithNewData: NewChatUser = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
