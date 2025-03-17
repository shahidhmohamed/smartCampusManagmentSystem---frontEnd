import { IGroupChat, NewGroupChat } from './group-chat.model';

export const sampleWithRequiredData: IGroupChat = {
  id: '98d1f6c6-4237-40cd-b99a-e3ffa6e5a389',
};

export const sampleWithPartialData: IGroupChat = {
  id: '22813834-8fcd-488e-886e-0d06cdd9b90f',
  createdAt: 'providence',
  ownerName: 'atop gripper absentmindedly',
};

export const sampleWithFullData: IGroupChat = {
  id: '9a0a6065-799c-484a-974c-992d6b434fe0',
  unreadCount: 'tabulate',
  muted: true,
  title: 'psst',
  type: 'intrepid during hm',
  createdAt: 'urgently alienated bare',
  owner: 'though',
  ownerName: 'damaged strictly swath',
};

export const sampleWithNewData: NewGroupChat = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
