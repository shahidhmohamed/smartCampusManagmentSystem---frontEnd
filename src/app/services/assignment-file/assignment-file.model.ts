import { MarkingStatus } from "./marking-status.model";


export interface IAssignmentFile {
  id: string;
  studentId?: string | null;
  assignmentId?: string | null;
  name?: string | null;
  type?: string | null;
  fileSize?: number | null;
  createdBy?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
  mimeType?: string | null;
  extension?: string | null;
  binaryData?: string | null;
  binaryDataContentType?: string | null;
  markingStatus?: keyof typeof MarkingStatus | null;
  grade?: number | null;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
}

export type NewAssignmentFile = Omit<IAssignmentFile, 'id'> & { id: null };
