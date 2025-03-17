export interface IChatUser {
    id: string;
    userId?: string | null;
    avatar?: string | null;
    name?: string | null;
    about?: string | null;
    title?: string | null;
    birthday?: string | null;
    address?: string | null;
    phoneNumber?: string | null;
}

export type NewChatUser = Omit<IChatUser, 'id'> & { id: null };
