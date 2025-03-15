import { ICourse, NewCourse } from './course.model';

export const sampleWithRequiredData: ICourse = {
  id: '4338577b-a082-4679-afc0-fa1424fca2ce',
};

export const sampleWithPartialData: ICourse = {
  id: 'c01ee4ef-36d5-4884-a31d-b5ec1e911951',
  courseName: 'boohoo',
  courseCode: 'unhealthy upon',
};

export const sampleWithFullData: ICourse = {
  id: 'f24c82f4-f51a-41d1-8dc9-2dbe9b6376f2',
  courseName: 'amidst scramble',
  courseCode: 'swiftly truthfully righteously',
  department: 'messy though expert',
  duration: 'only for intend',
};

export const sampleWithNewData: NewCourse = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
