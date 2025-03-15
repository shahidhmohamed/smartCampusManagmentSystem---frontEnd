import { IAssignment, NewAssignment } from './assignment.model';

export const sampleWithRequiredData: IAssignment = {
  id: 'f73ff6a5-3e3e-4e0f-bf24-1674f2a104e7',
};

export const sampleWithPartialData: IAssignment = {
  id: '08c6beae-0c7f-4701-8c2c-05098139d6ab',
  title: 'as defrag lashes',
  description: 'exotic',
  moduleId: 'lobster',
  instructorId: 'mostly woot gosh',
  createdBy: 'absent',
  modifiedAt: 'yippee',
  deadLine: 'slowly upward subexpression',
};

export const sampleWithFullData: IAssignment = {
  id: 'b27ff698-9680-46a3-863a-cd9b349fcbdb',
  title: 'humidity',
  description: 'syringe',
  courseId: 'inside yowza dental',
  moduleId: 'weary',
  instructorId: 'why tenement',
  createdBy: 'gifted',
  createdAt: 'although',
  modifiedAt: 'but',
  deadLine: 'sticker whose',
};

export const sampleWithNewData: NewAssignment = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
