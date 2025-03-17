import { NewMessage } from "../message/message.model";

export interface IChat {
  id: string;
  contactId?: string | null;
  contact?: string | null;
  unreadCount?: string | null;
  muted?: boolean | null;
  title?: string | null;
  type?: string | null;
  createdAt?: string | null;
  owner?: string | null;
  ownerName?: string | null;
  // messages?: NewMessage[];
}

export type NewChat = Omit<IChat, 'id'> & { id: null };
