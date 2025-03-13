import { IResource, NewResource } from './resource.model';

export const sampleWithRequiredData: IResource = {
  id: '8c0702be-9670-4492-95d1-e183e44400fa',
};

export const sampleWithPartialData: IResource = {
  id: '5e10e5a3-9478-485c-90fd-03707dc2fa65',
  resourceId: 'overburden',
  name: 'huzzah calmly bump',
  resourceType: 'STUDY_ROOM',
  location: 'wearily hence which',
};

export const sampleWithFullData: IResource = {
  id: '624e376c-a0a1-4b2a-a0e8-576b092170bf',
  resourceId: 'hole grandson',
  name: 'whoever recklessly acidly',
  resourceType: 'AUDITORIUM',
  location: 'pish investigate phew',
  capacity: 32266,
  availability: false,
};

export const sampleWithNewData: NewResource = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
