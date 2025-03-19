export interface IAttendence {
  id: string;
  createdAt?: string | null;
  courseId?: string | null;
  courseName?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  moduleId?: string | null;
  moduleName?: string | null;
}

export type NewAttendence = Omit<IAttendence, 'id'> & { id: null };
