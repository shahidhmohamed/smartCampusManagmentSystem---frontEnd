export interface IAttendenceStudentsRecord {
    id: string;
    attendenceId?: string | null;
    studentId?: string | null;
    studentName?: string | null;
    createdAt?: string | null;
    createdBy?: string | null;
    isPresent?: boolean | false;
}

export type NewAttendenceStudentsRecord = Omit<
    IAttendenceStudentsRecord,
    'id'
> & { id: null };
