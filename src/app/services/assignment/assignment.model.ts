import { IAssignmentFile } from "../assignment-file/assignment-file.model";

export interface IAssignment {
    id: string;
    title?: string | null;
    description?: string | null;
    courseId?: string | null;
    moduleId?: string | null;
    instructorId?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    modifiedAt?: string | null;
    deadLine?: string | null;
    isSubmitted?: boolean | null;
    submittedFile?: IAssignmentFile | null;
}

export type NewAssignment = Omit<IAssignment, 'id'> & { id: null };
