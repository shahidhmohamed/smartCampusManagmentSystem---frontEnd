export interface IClassSchedule {
    id: string;
    courseId?: string | null;
    moduleId?: string | null;
    instructorId?: string | null;
    scheduleDate?: string | null;
    scheduleTimeFrom?: string | null;
    scheduleTimeTo?: string | null;
    location?: string | null;
}

export type NewClassSchedule = Omit<IClassSchedule, 'id'> & { id: null };
