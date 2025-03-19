import { IAttendenceStudentsRecord, NewAttendenceStudentsRecord } from './attendence-students-record.model';

export const sampleWithRequiredData: IAttendenceStudentsRecord = {
  id: '6891622a-fec2-49c3-adca-09a7cabda939',
};

export const sampleWithPartialData: IAttendenceStudentsRecord = {
  id: '4ca1778c-61a0-4e9c-84df-5752750664f9',
  attendenceId: 'including whenever',
  studentId: 'amongst',
  createdAt: 'damp',
};

export const sampleWithFullData: IAttendenceStudentsRecord = {
  id: '81f75272-efb4-4942-8d8f-4fe57d0c677c',
  attendenceId: 'before fund because',
  studentId: 'mmm deficient',
  studentName: 'mockingly accentuate grumpy',
  createdAt: 'essence beside carelessly',
  createdBy: 'notwithstanding which',
};

export const sampleWithNewData: NewAttendenceStudentsRecord = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
