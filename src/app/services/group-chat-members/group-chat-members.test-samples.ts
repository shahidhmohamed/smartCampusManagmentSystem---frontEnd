import { IGroupChatMembers, NewGroupChatMembers } from './group-chat-members.model';

export const sampleWithRequiredData: IGroupChatMembers = {
  id: 'ea3a78ac-0077-41b6-9d46-b4419a11ff0d',
};

export const sampleWithPartialData: IGroupChatMembers = {
  id: 'ca2e4cd7-c10c-4942-8a53-6d3d0b0ecef9',
  groupChatId: 'reporter',
};

export const sampleWithFullData: IGroupChatMembers = {
  id: 'd0685b52-7cfc-4235-9724-74e983595ebb',
  groupChatId: 'deform',
  memberName: 'apud',
  memberUserId: 'fooey regarding',
};

export const sampleWithNewData: NewGroupChatMembers = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
