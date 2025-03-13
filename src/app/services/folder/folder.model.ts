export interface IFolder {
    id: string;
    name?: string | null;
    contents?: string | null;
    courseId?: string | null;
    course?: string | null;
    semester?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    modifiedAt?: string | null;
    parentId?: string | null;
}

export type NewFolder = Omit<IFolder, 'id'> & { id: null };
