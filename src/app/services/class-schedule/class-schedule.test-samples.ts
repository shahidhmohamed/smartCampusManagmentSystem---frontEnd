import { IClassSchedule, NewClassSchedule } from './class-schedule.model';

export const sampleWithRequiredData: IClassSchedule = {
  id: '140743db-f310-417c-96aa-aa09f1a5b5d0',
};

export const sampleWithPartialData: IClassSchedule = {
  id: '71d0cf58-2789-421c-892a-774d64af8e2e',
  courseId: 'handsome',
  moduleId: 'ajar',
  instructorId: 'mean siege nor',
  scheduleTime: 'reflate under',
};

export const sampleWithFullData: IClassSchedule = {
  id: '7e2d5e56-3aec-4f90-a3d7-a7a282a660d0',
  courseId: 'cinch because',
  moduleId: 'seriously',
  instructorId: 'soliloquy',
  scheduleDate: 'horde very if',
  scheduleTime: 'aboard presell',
};

export const sampleWithNewData: NewClassSchedule = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
