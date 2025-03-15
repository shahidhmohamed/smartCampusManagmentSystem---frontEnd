export interface ICourseRegistration {
    id: string;
    studentId?: string | null;
    courseId?: string | null;
    courseCode?: string | null;
    registrationDate?: string | null;
    duration?: string | null;
}

export type NewCourseRegistration = Omit<ICourseRegistration, 'id'> & {
    id: null;
};
