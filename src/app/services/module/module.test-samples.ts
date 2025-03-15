import { IModule, NewModule } from './module.model';

export const sampleWithRequiredData: IModule = {
  id: '4bb4b13a-73b6-46bb-a19a-8c81bc1c21ca',
};

export const sampleWithPartialData: IModule = {
  id: '5d7640d6-940f-40cb-88df-9d3fdb4d221e',
  moduleCode: 'indeed',
  courseId: 'unexpectedly righteously',
  lecturerId: 'wonderfully doubtfully',
};

export const sampleWithFullData: IModule = {
  id: '0439b340-bdc1-466c-84ad-934b3a928536',
  moduleName: 'longingly',
  moduleCode: 'around after',
  courseId: 'complicated inasmuch',
  lecturerId: 'fumigate rewrite lox',
  duration: 'chatter until',
};

export const sampleWithNewData: NewModule = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
