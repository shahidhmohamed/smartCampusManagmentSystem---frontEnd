export interface IGroupChat {
  id: string;
  unreadCount?: string | null;
  muted?: boolean | null;
  title?: string | null;
  type?: string | null;
  createdAt?: string | null;
  owner?: string | null;
  ownerName?: string | null;
}

export type NewGroupChat = Omit<IGroupChat, 'id'> & { id: null };
