import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ICourseRegistration } from '../course-registration.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../course-registration.test-samples';

import { CourseRegistrationService } from './course-registration.service';

const requireRestSample: ICourseRegistration = {
  ...sampleWithRequiredData,
};

describe('CourseRegistration Service', () => {
  let service: CourseRegistrationService;
  let httpMock: HttpTestingController;
  let expectedResult: ICourseRegistration | ICourseRegistration[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(CourseRegistrationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a CourseRegistration', () => {
      const courseRegistration = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(courseRegistration).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a CourseRegistration', () => {
      const courseRegistration = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(courseRegistration).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a CourseRegistration', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of CourseRegistration', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a CourseRegistration', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a CourseRegistration', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addCourseRegistrationToCollectionIfMissing', () => {
      it('should add a CourseRegistration to an empty array', () => {
        const courseRegistration: ICourseRegistration = sampleWithRequiredData;
        expectedResult = service.addCourseRegistrationToCollectionIfMissing([], courseRegistration);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(courseRegistration);
      });

      it('should not add a CourseRegistration to an array that contains it', () => {
        const courseRegistration: ICourseRegistration = sampleWithRequiredData;
        const courseRegistrationCollection: ICourseRegistration[] = [
          {
            ...courseRegistration,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addCourseRegistrationToCollectionIfMissing(courseRegistrationCollection, courseRegistration);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a CourseRegistration to an array that doesn't contain it", () => {
        const courseRegistration: ICourseRegistration = sampleWithRequiredData;
        const courseRegistrationCollection: ICourseRegistration[] = [sampleWithPartialData];
        expectedResult = service.addCourseRegistrationToCollectionIfMissing(courseRegistrationCollection, courseRegistration);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(courseRegistration);
      });

      it('should add only unique CourseRegistration to an array', () => {
        const courseRegistrationArray: ICourseRegistration[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const courseRegistrationCollection: ICourseRegistration[] = [sampleWithRequiredData];
        expectedResult = service.addCourseRegistrationToCollectionIfMissing(courseRegistrationCollection, ...courseRegistrationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const courseRegistration: ICourseRegistration = sampleWithRequiredData;
        const courseRegistration2: ICourseRegistration = sampleWithPartialData;
        expectedResult = service.addCourseRegistrationToCollectionIfMissing([], courseRegistration, courseRegistration2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(courseRegistration);
        expect(expectedResult).toContain(courseRegistration2);
      });

      it('should accept null and undefined values', () => {
        const courseRegistration: ICourseRegistration = sampleWithRequiredData;
        expectedResult = service.addCourseRegistrationToCollectionIfMissing([], null, courseRegistration, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(courseRegistration);
      });

      it('should return initial array if no CourseRegistration is added', () => {
        const courseRegistrationCollection: ICourseRegistration[] = [sampleWithRequiredData];
        expectedResult = service.addCourseRegistrationToCollectionIfMissing(courseRegistrationCollection, undefined, null);
        expect(expectedResult).toEqual(courseRegistrationCollection);
      });
    });

    describe('compareCourseRegistration', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareCourseRegistration(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: '130050bb-9f78-421e-9bdf-6a43ba0dfc9b' };
        const entity2 = null;

        const compareResult1 = service.compareCourseRegistration(entity1, entity2);
        const compareResult2 = service.compareCourseRegistration(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: '130050bb-9f78-421e-9bdf-6a43ba0dfc9b' };
        const entity2 = { id: '75889437-bc54-46ad-b827-8fef7afc2983' };

        const compareResult1 = service.compareCourseRegistration(entity1, entity2);
        const compareResult2 = service.compareCourseRegistration(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: '130050bb-9f78-421e-9bdf-6a43ba0dfc9b' };
        const entity2 = { id: '130050bb-9f78-421e-9bdf-6a43ba0dfc9b' };

        const compareResult1 = service.compareCourseRegistration(entity1, entity2);
        const compareResult2 = service.compareCourseRegistration(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
