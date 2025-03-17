import { IAssignmentFile, NewAssignmentFile } from './assignment-file.model';

export const sampleWithRequiredData: IAssignmentFile = {
  id: 'a3204f25-85f9-49c1-8d5b-0a10619eb045',
};

export const sampleWithPartialData: IAssignmentFile = {
  id: 'cd57164b-9d41-44c4-8dac-4dce39dbd5c8',
  assignmentId: 'absentmindedly',
  fileSize: 24103,
  createdAt: 'fluffy until after',
  mimeType: 'inwardly meanwhile joyously',
  extension: 'hence atop sunny',
  markingStatus: 'REVIEWED',
  gradedBy: 'past mosh',
  gradedAt: 'proper aw knowledgeably',
};

export const sampleWithFullData: IAssignmentFile = {
  id: 'a43c113e-4877-405a-856e-bfe0b4abb10c',
  studentId: 'or',
  assignmentId: 'under exhausted persecute',
  name: 'nervously pfft where',
  type: 'thoughtfully scarily gee',
  fileSize: 17012,
  createdBy: 'psst word aw',
  createdAt: 'phooey pfft wherever',
  modifiedAt: 'ceramic',
  mimeType: 'lest',
  extension: 'sardonic whether carefully',
  binaryData: '../fake-data/blob/hipster.png',
  binaryDataContentType: 'unknown',
  markingStatus: 'REVIEWED',
  grade: 18040.15,
  feedback: 'consequently',
  gradedBy: 'the inside fast',
  gradedAt: 'ew',
};

export const sampleWithNewData: NewAssignmentFile = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
