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
}

export type NewAssignment = Omit<IAssignment, 'id'> & { id: null };
