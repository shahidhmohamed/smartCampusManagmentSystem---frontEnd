import { IAttendence, NewAttendence } from './attendence.model';

export const sampleWithRequiredData: IAttendence = {
  id: '9b175595-f9c1-4dbd-82c3-a873b0f5ef40',
};

export const sampleWithPartialData: IAttendence = {
  id: '937b7317-8d02-494e-938b-21e11b28df96',
  createdAt: 'handover',
  instructorName: 'willow duffel parsnip',
  moduleId: 'by',
  moduleName: 'anxiously',
};

export const sampleWithFullData: IAttendence = {
  id: 'b8f14ddb-bacd-43f9-be33-f0305618b9de',
  createdAt: 'provided',
  courseId: 'absent drat',
  courseName: 'and',
  instructorId: 'flustered caption nor',
  instructorName: 'until scuffle',
  moduleId: 'impartial',
  moduleName: 'obscure',
};

export const sampleWithNewData: NewAttendence = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
