export interface IGroupChatMembers {
  id: string;
  groupChatId?: string | null;
  memberName?: string | null;
  memberUserId?: string | null;
}

export type NewGroupChatMembers = Omit<IGroupChatMembers, 'id'> & { id: null };
