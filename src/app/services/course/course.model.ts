export interface ICourse {
  id: string;
  courseName?: string | null;
  courseCode?: string | null;
  department?: string | null;
  duration?: string | null;
}

export type NewCourse = Omit<ICourse, 'id'> & { id: null };
