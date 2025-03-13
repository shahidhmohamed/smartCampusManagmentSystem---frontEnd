export interface User {
    id: string;
    uid: string;
    name: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    email: string;
    avatar?: string;
    status?: string;
    authorities?: string[];
}
